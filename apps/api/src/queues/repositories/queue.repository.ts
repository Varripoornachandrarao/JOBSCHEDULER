import { prisma } from '@job-scheduler/database';
import { QueueStatus } from '@job-scheduler/database';
import { RetryPolicyDto } from '../types/queue.types';

export class QueueRepository {
  createQueue(data: {
    projectId: string;
    id: string;
    name: string;
    description?: string | null;
    status: QueueStatus;
    priority: number;
    concurrency: number;
  }) {
    return prisma.queue.create({
      data: {
        id: data.id,
        projectId: data.projectId,
        name: data.name,
        description: data.description ?? null,
        status: data.status,
        priority: data.priority,
        concurrency: data.concurrency,
      },
      include: {
        defaultRetryPolicy: true,
      },
    });
  }

  upsertDefaultRetryPolicyForProject(projectId: string, retryPolicy: RetryPolicyDto) {
    // RetryPolicy is uniquely identified by (projectId, name)
    return prisma.retryPolicy.upsert({
      where: {
        projectId_name: {
          projectId,
          name: retryPolicy.name,
        },
      },
      update: {
        strategy: retryPolicy.strategy,
        maxAttempts: retryPolicy.maxAttempts,
        initialDelayMs: retryPolicy.initialDelayMs,
        maxDelayMs: retryPolicy.maxDelayMs ?? null,
        backoffMultiplier: retryPolicy.backoffMultiplier ?? 2.0,
        jitter: retryPolicy.jitter ?? true,
      },
      create: {
        projectId,
        name: retryPolicy.name,
        strategy: retryPolicy.strategy,
        maxAttempts: retryPolicy.maxAttempts,
        initialDelayMs: retryPolicy.initialDelayMs,
        maxDelayMs: retryPolicy.maxDelayMs ?? null,
        backoffMultiplier: retryPolicy.backoffMultiplier ?? 2.0,
        jitter: retryPolicy.jitter ?? true,
        description: null,
      },
    });
  }

  linkQueueToRetryPolicy(queueId: string, retryPolicyId: string) {
    return prisma.queue.update({
      where: { id: queueId },
      data: { defaultRetryPolicyId: retryPolicyId },
      include: { defaultRetryPolicy: true },
    });
  }

  findQueueById(queueId: string) {
    return prisma.queue.findUnique({
      where: { id: queueId },
      include: {
        project: { select: { organizationId: true } },
        defaultRetryPolicy: true,
      },
    });
  }

  findQueuesByProjectId(projectId: string) {
    return prisma.queue.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        defaultRetryPolicy: true,
      },
    });
  }

  updateQueue(queueId: string, data: {
    name?: string;
    description?: string | null;
    status?: QueueStatus;
    priority?: number;
    concurrency?: number;
  }) {
    return prisma.queue.update({
      where: { id: queueId },
      data,
      include: { defaultRetryPolicy: true },
    });
  }

  deleteQueueHard(queueId: string) {
    return prisma.queue.delete({
      where: { id: queueId },
    });
  }

  pauseQueue(queueId: string) {
    return prisma.queue.update({
      where: { id: queueId },
      data: { status: QueueStatus.PAUSED },
      include: { defaultRetryPolicy: true },
    });
  }

  resumeQueue(queueId: string) {
    return prisma.queue.update({
      where: { id: queueId },
      data: { status: QueueStatus.ACTIVE },
      include: { defaultRetryPolicy: true },
    });
  }
}

