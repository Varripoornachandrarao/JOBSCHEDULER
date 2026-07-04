import { QueueStatus, RetryStrategy } from '@job-scheduler/database';

export type Priority = number;
export type Concurrency = number;

export interface RetryPolicyDto {
  name: string;
  strategy: RetryStrategy;
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs?: number | null;
  backoffMultiplier?: number;
  jitter?: boolean;
}

export interface QueueDto {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  status: QueueStatus;
  priority: number;
  concurrency: number;
  retryPolicy?: RetryPolicyDto | null;
  createdAt: Date;
  updatedAt: Date;
}

