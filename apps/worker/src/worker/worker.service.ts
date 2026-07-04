import os from 'os';
import { prisma } from '@job-scheduler/database';
import { redisConnection } from '../config/redis';
import { BullMQQueueName } from './worker.types';
import { WorkerRepository } from '../worker/repositories/worker.repository';
import { JobExecutionRepository } from '../worker/repositories/jobExecution.repository';
import { JobLogRepository } from '../worker/repositories/jobLog.repository';
import { GenericJobProcessor } from './processors/genericJobProcessor';
import { BullMQWorkerRunner } from './bullmq/bullmqWorkerRunner';
import { HeartbeatService } from './services/heartbeat.service';
import { GracefulShutdown } from './services/gracefulShutdown.service';
import { SocketEventEmitter } from './services/socketEventEmitter';

export class WorkerService {
  private readonly hostname = os.hostname();

  private workerId: string | null = null;
  private heartbeatService: HeartbeatService | null = null;
  private shutdown: GracefulShutdown | null = null;

  // BullMQ runner consumes jobs; queue subscription is derived from env/DB mapping.
  private bullmqRunner: BullMQWorkerRunner | null = null;

  private readonly workerRepo: WorkerRepository;
  private readonly jobExecutionRepo: JobExecutionRepository;
  private readonly jobLogRepo: JobLogRepository;
  private readonly processor: GenericJobProcessor;
  private readonly socketEmitter: SocketEventEmitter;

  constructor() {
    this.workerRepo = new WorkerRepository();
    this.jobExecutionRepo = new JobExecutionRepository();
    this.jobLogRepo = new JobLogRepository();
    this.processor = new GenericJobProcessor({
      jobLogRepo: this.jobLogRepo,
    });
    this.socketEmitter = new SocketEventEmitter();
  }

  async start() {
    // Readiness checks
    await prisma.$queryRaw`SELECT 1`;
    await redisConnection.ping();

    // Register worker
    const workerProjectId = process.env.WORKER_PROJECT_ID;
    if (!workerProjectId) {
      throw new Error('WORKER_PROJECT_ID env var is required for worker registration');
    }

    const workerName = process.env.WORKER_NAME || `worker-${this.hostname}`;
    const queueId = process.env.WORKER_QUEUE_ID || null;

    this.workerId = await this.workerRepo.registerWorker({
      projectId: workerProjectId,
      queueId,
      name: workerName,
      hostname: this.hostname,
      ipAddress: process.env.WORKER_IP_ADDRESS || null,
    });

    this.socketEmitter.emit('worker:registered', {
      workerId: this.workerId,
    });

    // Heartbeats
    this.heartbeatService = new HeartbeatService({
      workerId: this.workerId,
      workerRepo: this.workerRepo,
      socketEmitter: this.socketEmitter,
      cpuProvider: () => {
        const cpus = os.cpus();
        let total = 0;
        for (const c of cpus) total += c.times.user + c.times.sys;
        return total / Math.max(1, cpus.length);
      },
      memoryProvider: () => BigInt(os.totalmem() - os.freemem()),
      activeJobsCountProvider: () => this.bullmqRunner?.activeJobsCount ?? 0,
      intervalMs: 30_000,
    });
    await this.heartbeatService.start();

    // BullMQ Worker runner
    this.bullmqRunner = new BullMQWorkerRunner({
      workerId: this.workerId,
      redisConnection,
      workerRepo: this.workerRepo,
      jobExecutionRepo: this.jobExecutionRepo,
      jobLogRepo: this.jobLogRepo,
      processor: this.processor,
      socketEmitter: this.socketEmitter,
      queueNames: this.resolveQueueNames(),
    });

    await this.bullmqRunner.start();

    // Graceful shutdown
    this.shutdown = new GracefulShutdown({
      workerId: this.workerId,
      workerRepo: this.workerRepo,
      bullmqRunner: this.bullmqRunner,
      heartbeatService: this.heartbeatService,
      socketEmitter: this.socketEmitter,
    });
    this.shutdown.bind();
  }

  private resolveQueueNames(): BullMQQueueName[] {
    // Phase 7: do not redesign. Use env if provided; otherwise a default single queue.
    const q = process.env.BULLMQ_QUEUE_NAME;
    if (q) return [q as BullMQQueueName];

    // Fallback: single queue per service container.
    return ['default'];
  }

  async stop() {
    await this.shutdown?.shutdown();
  }
}

