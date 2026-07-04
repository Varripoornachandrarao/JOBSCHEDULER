import { z } from 'zod';
import { WorkerStatus } from '@job-scheduler/database';

export const workerIdSchema = z.string().uuid();

export const workerRegistrationSchema = z.object({
  projectId: z.string().uuid(),
  queueId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  hostname: z.string().min(1).max(200),
  ipAddress: z.string().nullable().optional(),
  concurrencyLimit: z.number().int().positive().max(1000).optional(),
});

export const workerHeartbeatSchema = z.object({
  workerId: z.string().uuid(),
  status: z.nativeEnum(WorkerStatus),
  cpuUsagePercent: z.number().min(0).max(1000),
  memoryUsageBytes: z.any(),
  activeJobsCount: z.number().int().min(0).max(100000),
});

export function parseBigIntFromUnknown(v: unknown): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(Math.trunc(v));
  if (typeof v === 'string') return BigInt(v);
  throw new Error('Invalid bigint value');
}

