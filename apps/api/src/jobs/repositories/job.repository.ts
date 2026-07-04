import { prisma } from '@job-scheduler/database';
import { JobStatus, RetryStrategy, RetryPolicy, ScheduledJob, JobType, Prisma, QueueStatus } from '@job-scheduler/database';

export class JobRepository {
  findQueueById(queueId: string) {
    return prisma.queue.findUnique({
      where: { id: queueId },
      select: {
        id: true,
        projectId: true,
        project: {
          select: { organizationId: true },
        },
      },
    });
  }

  existsJob(jobId: string) {
    return prisma.job.findUnique({ where: { id: jobId }, select: { id: true } }).then((r) => !!r);
  }

  createJob(data: {
    id: string;
    projectId: string;
    queueId: string;
    retryPolicyId?: string;
    scheduledJobId?: string;
    type: JobType;
    name: string;
    payload: any;
    status: JobStatus;
    priority: number;
    runAt: Date;
    batchKey?: string | null;
  }) {
    return prisma.job.create({
      data: {
        id: data.id,
        projectId: data.projectId,
        queueId: data.queueId,
        retryPolicyId: data.retryPolicyId ?? null,
        scheduledJobId: data.scheduledJobId ?? null,
        type: data.type,
        name: data.name,
        payload: data.payload,
        status: data.status,
        priority: data.priority,
        runAt: data.runAt,
        batchKey: data.batchKey ?? null,
      },
      include: {
        queue: {
          select: {
            id: true,
            projectId: true,
            project: { select: { organizationId: true } },
          },
        },
        retryPolicy: true,
        scheduledJob: true,
      },
    });
  }

  findJobsByQueueId(
    queueId: string,
    options: {
      take: number;
      orderBy: Prisma.JobOrderByWithRelationInput;
    },
  ) {
    return prisma.job.findMany({
      where: { queueId },
      orderBy: options.orderBy,
      take: options.take,
      include: {
        queue: {
          select: {
            id: true,
            projectId: true,
            project: { select: { organizationId: true } },
          },
        },
        retryPolicy: true,
        scheduledJob: true,
      },
    });
  }

  findJobById(jobId: string) {
    return prisma.job.findUnique({
      where: { id: jobId },
      include: {
        queue: {
          include: {
            project: { select: { organizationId: true } },
          },
        },
        retryPolicy: true,
        scheduledJob: true,
      },
    });
  }

  updateJob(
    jobId: string,
    data: {
      name?: string;
      payload?: any;
      priority?: number;
      retryPolicyId?: string | null;
      scheduledJobId?: string | null;
      status?: JobStatus;
      runAt?: Date;
      attemptCount?: number;
      lastError?: string | null;
      batchKey?: string | null;
      metadata?: any;
    },
  ) {
    // Job model doesn't have metadata field in schema; metadata in request is expected to be included in payload.
    // Keep parameter to avoid breaking API contract, but persist into payload if provided.
    const updateData: Prisma.JobUpdateInput = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.payload !== undefined ? { payload: data.payload } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.retryPolicyId !== undefined ? { retryPolicyId: data.retryPolicyId } : {}),
      ...(data.scheduledJobId !== undefined ? { scheduledJobId: data.scheduledJobId } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.runAt !== undefined ? { runAt: data.runAt } : {}),
      ...(data.attemptCount !== undefined ? { attemptCount: data.attemptCount } : {}),
      ...(data.lastError !== undefined ? { lastError: data.lastError } : {}),
      ...(data.batchKey !== undefined ? { batchKey: data.batchKey } : {}),
    };

    return prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: {
        queue: {
          include: {
            project: { select: { organizationId: true } },
          },
        },
        retryPolicy: true,
        scheduledJob: true,
      },
    });
  }

  deleteJobHard(jobId: string) {
    return prisma.job.delete({ where: { id: jobId } });
  }

  upsertRetryPolicy(projectId: string, input: {
    name: string;
    strategy: any;
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs?: number | null;
    backoffMultiplier?: number;
    jitter?: boolean;
  }) {
    return prisma.retryPolicy.upsert({
      where: {
        projectId_name: {
          projectId,
          name: input.name,
        },
      },
      update: {
        strategy: input.strategy,
        maxAttempts: input.maxAttempts,
        initialDelayMs: input.initialDelayMs,
        maxDelayMs: input.maxDelayMs ?? null,
        backoffMultiplier: input.backoffMultiplier ?? 2.0,
        jitter: input.jitter ?? true,
      },
      create: {
        projectId,
        name: input.name,
        strategy: input.strategy,
        maxAttempts: input.maxAttempts,
        initialDelayMs: input.initialDelayMs,
        maxDelayMs: input.maxDelayMs ?? null,
        backoffMultiplier: input.backoffMultiplier ?? 2.0,
        jitter: input.jitter ?? true,
        description: null,
      },
    });
  }

  upsertScheduledJobForCron(data: {
    projectId: string;
    queueId: string;
    name: string;
    cronExpression: string;
    payload: any;
    priority: number;
    timezone: string;
    startAt: Date | null;
  }) {
    return prisma.scheduledJob.upsert({
      where: {
        projectId_name: {
          projectId: data.projectId,
          name: data.name,
        },
      },
      update: {
        queueId: data.queueId,
        cronExpression: data.cronExpression,
        payload: data.payload,
        priority: data.priority,
        timezone: data.timezone,
        startAt: data.startAt,
        isActive: true,
      },
      create: {
        projectId: data.projectId,
        queueId: data.queueId,
        name: data.name,
        type: 'RECURRING',
        cronExpression: data.cronExpression,
        payload: data.payload,
        priority: data.priority,
        timezone: data.timezone,
        startAt: data.startAt,
        nextRunAt: new Date(),
        isActive: true,
      },
    });
  }
}

