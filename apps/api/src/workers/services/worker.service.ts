import { WorkerStatus } from '@job-scheduler/database';
import { AppError } from '../../auth/utils/app-error';
import { WorkerRepository } from '../repositories/worker.repository';
import { WorkerDto, WorkerRegistrationPayloadDto } from '../dto/worker.dto';

function toWorkerDto(worker: any): WorkerDto {
  return {
    id: worker.id,
    projectId: worker.projectId,
    queueId: worker.queueId,
    name: worker.name,
    hostname: worker.hostname,
    ipAddress: worker.ipAddress,
    status: worker.status,
    concurrencyLimit: worker.concurrencyLimit,
    lastHeartbeatAt: worker.lastHeartbeatAt,
    startedAt: worker.startedAt,
    stoppedAt: worker.stoppedAt,
    createdAt: worker.createdAt,
    updatedAt: worker.updatedAt,
  };
}

export class WorkerService {
  constructor(private readonly repo = new WorkerRepository()) {}

  async register(payload: WorkerRegistrationPayloadDto) {
    const worker = await this.repo.registerWorker({
      projectId: payload.projectId,
      queueId: payload.queueId ?? null,
      name: payload.name,
      hostname: payload.hostname,
      ipAddress: payload.ipAddress ?? null,
      concurrencyLimit: payload.concurrencyLimit,
    });

    return { worker: toWorkerDto(worker) };
  }

  async getAll() {
    const workers = await this.repo.findAll();
    return { workers: workers.map(toWorkerDto) };
  }

  async getById(workerId: string) {
    const worker = await this.repo.findById(workerId);
    if (!worker) throw new AppError(404, 'WORKER_NOT_FOUND', 'Worker not found');
    return { worker: toWorkerDto(worker) };
  }

  async heartbeat(data: {
    workerId: string;
    status: WorkerStatus;
    cpuUsagePercent: number;
    memoryUsageBytes: bigint;
    activeJobsCount: number;
  }) {
    const res = await this.repo.setHeartbeat(data);
    return { worker: toWorkerDto(res.worker) };
  }

  async offline(workerId: string) {
    const worker = await this.repo.findById(workerId);
    if (!worker) throw new AppError(404, 'WORKER_NOT_FOUND', 'Worker not found');
    const updated = await this.repo.setOffline(workerId);
    return { worker: toWorkerDto(updated) };
  }
}

