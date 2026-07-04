import { Worker, WorkerStatus } from '@job-scheduler/database';

export interface WorkerDto {
  id: string;
  projectId: string;
  queueId: string | null;
  name: string;
  hostname: string;
  ipAddress: string | null;
  status: WorkerStatus;
  concurrencyLimit: number;
  lastHeartbeatAt: Date | null;
  startedAt: Date;
  stoppedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerResponseDto {
  worker: WorkerDto;
}

export interface WorkerListResponseDto {
  workers: WorkerDto[];
}

export interface WorkerRegistrationPayloadDto {
  projectId: string;
  queueId?: string | null;
  name: string;
  hostname: string;
  ipAddress?: string | null;
  concurrencyLimit?: number;
}

export interface WorkerHeartbeatPayloadDto {
  workerId: string;
  status: WorkerStatus;
  cpuUsagePercent: number;
  memoryUsageBytes: bigint;
  activeJobsCount: number;
}

export interface ApiMessageDto {
  message: string;
}

