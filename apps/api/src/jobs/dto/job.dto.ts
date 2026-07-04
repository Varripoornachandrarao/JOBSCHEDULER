import { JobStatus, JobType } from '@job-scheduler/database';

export interface RetryPolicyDto {
  name: string;
  strategy: any;
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs?: number | null;
  backoffMultiplier: number;
  jitter: boolean;
}

export interface JobDto {
  id: string;
  queueId: string;
  projectId: string;
  name: string;
  payload: any;
  status: JobStatus;
  type: JobType;
  priority: number;
  runAt: Date;
  batchKey?: string | null;
  attemptCount: number;
  retryPolicy: RetryPolicyDto | null;
  scheduledJobId: string | null;
  scheduledJob?: {
    id: string;
    cronExpression: string | null;
    nextRunAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toRetryPolicyDto(rp: any): RetryPolicyDto | null {
  if (!rp) return null;
  return {
    name: rp.name,
    strategy: rp.strategy,
    maxAttempts: rp.maxAttempts,
    initialDelayMs: rp.initialDelayMs,
    maxDelayMs: rp.maxDelayMs,
    backoffMultiplier: rp.backoffMultiplier,
    jitter: rp.jitter,
  };
}

export function toJobDto(job: any): JobDto {
  return {
    id: job.id,
    queueId: job.queueId,
    projectId: job.projectId,
    name: job.name,
    payload: job.payload,
    status: job.status,
    type: job.type,
    priority: job.priority,
    runAt: job.runAt,
    batchKey: job.batchKey,
    attemptCount: job.attemptCount,
    retryPolicy: toRetryPolicyDto(job.retryPolicy),
    scheduledJobId: job.scheduledJobId,
    scheduledJob: job.scheduledJob
      ? {
          id: job.scheduledJob.id,
          cronExpression: job.scheduledJob.cronExpression,
          nextRunAt: job.scheduledJob.nextRunAt,
        }
      : null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export interface JobListDto {
  jobs: JobDto[];
}

export interface JobResponseDto {
  job: JobDto;
}

export interface MessageResponseDto {
  message: string;
}

