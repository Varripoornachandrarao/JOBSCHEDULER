import { WorkerRepository } from '../repositories/worker.repository';
import { BullMQWorkerRunner } from '../bullmq/bullmqWorkerRunner';
import { HeartbeatService } from './heartbeat.service';
import { SocketEventEmitter } from './socketEventEmitter';

export class GracefulShutdown {
  private shuttingDown = false;

  constructor(private deps: {
    workerId: string;
    workerRepo: WorkerRepository;
    bullmqRunner: BullMQWorkerRunner;
    heartbeatService: HeartbeatService;
    socketEmitter: SocketEventEmitter;
  }) {}

  bind() {
    process.on('SIGTERM', () => {
      this.shutdown().catch(() => undefined);
    });
    process.on('SIGINT', () => {
      this.shutdown().catch(() => undefined);
    });
  }

  async shutdown() {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    // Stop heartbeat early
    await this.deps.heartbeatService.stop().catch(() => undefined);

    // Mark offline
    await this.deps.workerRepo.setOffline(this.deps.workerId).catch(() => undefined);

    this.deps.socketEmitter.emit('worker:offline', { workerId: this.deps.workerId });

    // Stop worker runner (BullMQ close waits best-effort for active jobs)
    await this.deps.bullmqRunner.stop().catch(() => undefined);

    process.exit(0);
  }
}

