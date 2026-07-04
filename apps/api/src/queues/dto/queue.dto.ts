import { QueueStatus } from '@job-scheduler/database';
import { RetryPolicyDto, QueueDto } from '../types/queue.types';

export interface QueueListDto {
  queues: QueueDto[];
}

export interface QueueResponseDto {
  queue: QueueDto;
}


export function toRetryPolicyDto(
  rp:
    | {
        id: string;
        name: string;
        description: string | null;
        strategy: any;
        maxAttempts: number;
        initialDelayMs: number;
        maxDelayMs: number | null;
        backoffMultiplier: number;
        jitter: boolean;
      }
    | null
    | undefined,
): RetryPolicyDto | null {
  if (!rp) return null;

  return {
    name: rp.name,
    strategy: rp.strategy,
    maxAttempts: rp.maxAttempts,
    initialDelayMs: rp.initialDelayMs,
    maxDelayMs: rp.maxDelayMs ?? undefined,
    backoffMultiplier: rp.backoffMultiplier,
    jitter: rp.jitter,
  };
}

export function toQueueDto(
  q:
    | {
        id: string;
        projectId: string;
        name: string;
        description: string | null;
        status: QueueStatus;
        priority: number;
        concurrency: number;
        defaultRetryPolicy: any | null;
        createdAt: Date;
        updatedAt: Date;
      }
    | any,
): QueueDto {
  return {
    id: q.id,
    projectId: q.projectId,
    name: q.name,
    description: q.description,
    status: q.status,
    priority: q.priority,
    concurrency: q.concurrency,
    retryPolicy: toRetryPolicyDto(q.defaultRetryPolicy),
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

