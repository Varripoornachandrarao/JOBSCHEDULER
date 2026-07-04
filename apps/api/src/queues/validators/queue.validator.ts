import { z } from 'zod';
import { RetryStrategy } from '@job-scheduler/database';
import { QueueStatus } from '@job-scheduler/database';

export const paramsProjectIdSchema = z.object({
  projectId: z.string().uuid('Project id must be a valid UUID'),
});

export const paramsQueueIdSchema = z.object({
  queueId: z.string().uuid('Queue id must be a valid UUID'),
});

const retryPolicySchema = z.object({
  name: z.string().trim().min(1, 'Retry policy name is required').max(120),
  strategy: z.nativeEnum(RetryStrategy),
  maxAttempts: z.number().int().min(1).max(1000),
  initialDelayMs: z.number().int().min(0).max(86_400_000),
  maxDelayMs: z.number().int().min(0).max(86_400_000).nullable().optional(),
  backoffMultiplier: z.number().min(0).max(1_000_000).optional(),
  jitter: z.boolean().optional(),
});

export const createQueueSchema = z
  .object({
    name: z.string().trim().min(1, 'Queue name is required').max(120),
    description: z.string().trim().max(500).optional(),
    priority: z.number().int().min(-1000).max(1000).optional().default(0),
    concurrency: z.number().int().min(1).max(10_000).optional().default(5),
    status: z.nativeEnum(QueueStatus).optional().default(QueueStatus.ACTIVE),
    retryPolicy: retryPolicySchema.optional(),
  })
  .refine((v) => v.name !== undefined && v.name.trim().length > 0, {
    message: 'Queue name is required',
    path: ['name'],
  });

export const updateQueueSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    priority: z.number().int().min(-1000).max(1000).optional(),
    concurrency: z.number().int().min(1).max(10_000).optional(),
    status: z.nativeEnum(QueueStatus).optional(),
    retryPolicy: retryPolicySchema.optional(),
    // Note: pause/resume are handled by dedicated endpoints
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required',
  });

export type CreateQueueInput = z.infer<typeof createQueueSchema>;
export type UpdateQueueInput = z.infer<typeof updateQueueSchema>;
export type ParamsProjectIdInput = z.infer<typeof paramsProjectIdSchema>;
export type ParamsQueueIdInput = z.infer<typeof paramsQueueIdSchema>;

export const retryPolicyInputSchema = retryPolicySchema;

