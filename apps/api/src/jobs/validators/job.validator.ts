import { z } from 'zod';
import { MemberRole, JobType } from '@job-scheduler/database';
import { JobStatus } from '@job-scheduler/database';

export const paramsQueueIdSchema = z.object({
  queueId: z.string().uuid('queueId must be a valid UUID'),
});

export const paramsJobIdSchema = z.object({
  jobId: z.string().uuid('jobId must be a valid UUID'),
});

const retryPolicySchema = z.object({
  name: z.string().trim().min(1).max(120),
  strategy: z.enum(['FIXED', 'LINEAR', 'EXPONENTIAL']),
  maxAttempts: z.number().int().min(1).max(1000),
  initialDelayMs: z.number().int().min(0).max(86_400_000),
  maxDelayMs: z.number().int().min(0).max(86_400_000).nullable().optional(),
  backoffMultiplier: z.number().min(0).max(1_000_000).optional(),
  jitter: z.boolean().optional(),
});

const cronExpressionBasicSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine((v) => {
    // Basic: 5 space-separated fields (minute hour day month day-of-week)
    const parts = v.split(/\s+/).filter(Boolean);
    return parts.length === 5;
  }, 'cronExpression must have 5 space-separated fields');

const payloadSchema = z
  .any()
  .refine((v) => v !== undefined, 'payload is required')
  .refine((v) => v !== null, 'payload is required');

export const createJobSchema = z
  .object({
    name: z.string().trim().min(1).max(240),
    payload: payloadSchema,
    priority: z.number().int().min(-1000).max(1000).optional().default(0),
    delay: z.number().int().min(0).optional(),
    scheduledTime: z.coerce.date().optional(),
    cronExpression: cronExpressionBasicSchema.optional(),
    batchId: z.string().uuid().optional(),
    retryPolicy: retryPolicySchema.optional(),
    metadata: z.any().optional(),
  })
  .superRefine((val, ctx) => {
    const hasScheduling =
      val.cronExpression !== undefined || val.scheduledTime !== undefined || val.delay !== undefined;

    // If cronExpression exists, it must be non-empty; if scheduledTime exists, it must be a valid date (coerce handles it).
    if (!hasScheduling && val.batchId === undefined) {
      // immediate job is allowed; no error
    }

    // Guard: delay must not be present with negative already handled by schema

    // Guard: batch jobs can combine with other scheduling fields, but cron is treated as recurring.
  });

export const updateJobSchema = z
  .object({
    name: z.string().trim().min(1).max(240).optional(),
    payload: payloadSchema.optional(),
    priority: z.number().int().min(-1000).max(1000).optional(),
    delay: z.number().int().min(0).optional(),
    scheduledTime: z.coerce.date().optional(),
    cronExpression: cronExpressionBasicSchema.nullable().optional(),
    batchId: z.string().uuid().nullable().optional(),
    retryPolicy: retryPolicySchema.nullable().optional(),
    metadata: z.any().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required');

export const retryJobBodySchema = z
  .object({
    attemptCount: z.number().int().min(1).optional(),
  })
  .optional();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export type RetryJobInput = z.infer<typeof retryJobBodySchema>;


