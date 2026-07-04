import { Worker } from 'bullmq';
import { JobStatus, WorkerStatus } from '@job-scheduler/database';
import { prisma } from '@job-scheduler/database';
import { JobLogLevel } from '@job-scheduler/database';
import { JobExecutionRepository } from '../repositories/jobExecution.repository';
import { JobLogRepository } from '../repositories/jobLog.repository';
import { WorkerRepository } from '../repositories/worker.repository';
import { GenericJobProcessor } from '../processors/genericJobProcessor';
import { BullMQQueueName } from '../worker.types';
import { SocketEventEmitter } from '../services/socketEventEmitter';

export class BullMQWorkerRunner {
  public activeJobsCount = 0;

  private worker: Worker | null = null;

  constructor(private deps: {
    workerId: string;
    redisConnection: any;
    workerRepo: WorkerRepository;
    jobExecutionRepo: JobExecutionRepository;
    jobLogRepo: JobLogRepository;
    processor: GenericJobProcessor;
    socketEmitter: SocketEventEmitter;
    queueNames: BullMQQueueName[];
  }) {}

  async start() {
    const { redisConnection } = this.deps;

    // BullMQ Worker locks jobs atomically by default.
    // We ensure Job.status RUNNING + JobExecution creation happens once.
    this.worker = new Worker(this.deps.queueNames[0], async (job: any) => {
      return this.processJob(job);
    }, {
      connection: redisConnection,
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
      // Ensure lock duration is enough for typical execution time.
      lockDuration: 300_000,
    });

    this.worker.on('completed', () => {
      // no-op; handled in processJob
    });

    this.worker.on('failed', () => {
      // no-op
    });
  }

  private async processJob(job: any) {
    this.activeJobsCount += 1;

    const { workerId, workerRepo, jobExecutionRepo, jobLogRepo, processor, socketEmitter } = this.deps;

    const claimLock = job.lockKey ? job.lockKey : undefined;

    // Atomic job claiming: rely on BullMQ lock; additionally set status with a guarded update.
    // Job payload is expected to include jobId.
    const jobId: string = job.id;

    // Update worker status to BUSY
    await workerRepo.setHeartbeatAndStatus({
      workerId,
      status: WorkerStatus.ACTIVE,
      lastHeartbeatAt: new Date(),
      heartbeatCpuUsagePercent: 0,
      heartbeatMemoryUsageBytes: BigInt(0),
      activeJobsCount: this.activeJobsCount,
    }).catch(() => undefined);


    await jobLogRepo.writeLog({
      jobId,
      executionId: null,
      level: JobLogLevel.INFO,
      message: 'Job claimed by worker',
    });

    socketEmitter.emit('job:started', { jobId, workerId });

    // Create JobExecution (attempt)
    const attempt = (job.attemptsMade ?? 0) + 1;
    const execution = await jobExecutionRepo.createExecution({
      jobId,
      workerId,
      attempt,
      status: JobStatus.RUNNING,
    });

    // Guard: ensure job transitions to RUNNING only once.
    const updated = await prisma.job.updateMany({
      where: { id: jobId, status: { in: [JobStatus.QUEUED, JobStatus.SCHEDULED, JobStatus.DELAYED, JobStatus.PENDING] } },
      data: { status: JobStatus.RUNNING, assignedWorkerId: workerId, startedAt: new Date(), lockedAt: new Date() },
    });

    if (updated.count === 0) {
      // Another worker may have run; treat as already running.
      await jobLogRepo.writeLog({
        jobId,
        executionId: execution.id,
        level: JobLogLevel.WARN,
        message: 'Job was not in claimable state; skipping execution',
      });
      socketEmitter.emit('job:completed', { jobId, workerId, skipped: true });
      this.activeJobsCount -= 1;
      return;
    }

    try {
      const result = await processor.process({
        jobId,
        jobName: job?.name,
        payload: job?.data,
        executionId: execution.id,
        workerId,
      });

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.SUCCEEDED,
          finishedAt: new Date(),
          lastError: null,
        },
      });

      await jobExecutionRepo.completeExecution({
        executionId: execution.id,
        status: JobStatus.SUCCEEDED,
      });

      await jobLogRepo.writeLog({
        jobId,
        executionId: execution.id,
        level: JobLogLevel.INFO,
        message: 'Job completed successfully',
        metadata: result,
      });

      socketEmitter.emit('job:completed', { jobId, workerId });
      return result;
    } catch (err: any) {
      const message = err?.message || 'Job execution failed';
      const stack = err?.stack;

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          finishedAt: new Date(),
          lastError: message,
        },
      });

      await jobExecutionRepo.failExecution({
        executionId: execution.id,
        status: JobStatus.FAILED,
        errorMessage: message,
        stackTrace: stack,
      });

      await jobLogRepo.writeLog({
        jobId,
        executionId: execution.id,
        level: JobLogLevel.ERROR,
        message: 'Job failed',
        metadata: { error: message },
      });

      socketEmitter.emit('job:failed', { jobId, workerId, error: message });
      throw err;
    } finally {
      this.activeJobsCount -= 1;
    }
  }

  async stop() {
    await this.worker?.close();
  }
}

