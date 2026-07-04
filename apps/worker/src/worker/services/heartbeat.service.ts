import { WorkerStatus } from '@job-scheduler/database';
import { WorkerRepository } from '../repositories/worker.repository';
import { SocketEventEmitter } from './socketEventEmitter';

export class HeartbeatService {
  private timer: NodeJS.Timeout | null = null;

  constructor(private deps: {
    workerId: string;
    workerRepo: WorkerRepository;
    socketEmitter: SocketEventEmitter;
    cpuProvider: () => number;
    memoryProvider: () => bigint;
    activeJobsCountProvider: () => number;
    intervalMs: number;
  }) {}

  async start() {
    await this.tick();
    this.timer = setInterval(() => {
      this.tick().catch(() => undefined);
    }, this.deps.intervalMs);
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async tick() {
    const active = this.deps.activeJobsCountProvider();

    // Map to Prisma WorkerStatus.
    const status = active > 0 ? WorkerStatus.ACTIVE : WorkerStatus.IDLE;

    const cpuUsagePercent = Number.isFinite(this.deps.cpuProvider()) ? this.deps.cpuProvider() : 0;
    const memoryUsageBytes = this.deps.memoryProvider();

    await this.deps.workerRepo.setHeartbeatAndStatus({
      workerId: this.deps.workerId,
      status,
      lastHeartbeatAt: new Date(),
      heartbeatCpuUsagePercent: cpuUsagePercent,
      heartbeatMemoryUsageBytes: memoryUsageBytes,
      activeJobsCount: active,
    });

    this.deps.socketEmitter.emit('worker:heartbeat', {
      workerId: this.deps.workerId,
      status,
      activeJobsCount: active,
    });
  }
}

