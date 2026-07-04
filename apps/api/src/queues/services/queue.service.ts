import { MemberRole, Prisma } from '@job-scheduler/database';
import { AppError } from '../../auth/utils/app-error';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { QueueRepository } from '../repositories/queue.repository';
import { CreateQueueInput, UpdateQueueInput } from '../validators/queue.validator';
import { QueueDto } from '../types/queue.types';

import { toQueueDto } from '../dto/queue.dto';
import { QueueStatus } from '@job-scheduler/database';

import { retryPolicyInputSchema } from '../validators/queue.validator';

export class QueueService {
  constructor(private readonly repo = new QueueRepository()) {}

  private async assertProjectRole(userId: string, projectId: string, roles: MemberRole[]) {
    const authRepository = new AuthRepository();

    const project = await (await import('@job-scheduler/database')).prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });


    if (!project) {
      throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    const allowed = await authRepository.userHasOrganizationRole(userId, project.organizationId, roles);
    if (!allowed) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource');
    }

    return project.organizationId;
  }

  private async assertQueueRole(userId: string, queueId: string, roles: MemberRole[]) {
    const queue = await this.repo.findQueueById(queueId);
    if (!queue) {
      throw new AppError(404, 'QUEUE_NOT_FOUND', 'Queue not found');
    }

    const allowed = await new AuthRepository().userHasOrganizationRole(
      userId,
      queue.project.organizationId,
      roles,
    );

    if (!allowed) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource');
    }

    return queue;
  }

  async createQueue(projectId: string, input: CreateQueueInput, user: { id: string }) {
    const { id: userId } = user;
    await this.assertProjectRole(userId, projectId, [MemberRole.OWNER, MemberRole.ADMIN]);

    const queueId = (await import('crypto')).randomUUID();


    try {
      const created = await this.repo.createQueue({
        projectId,
        id: queueId,
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? QueueStatus.ACTIVE,
        priority: input.priority ?? 0,
        concurrency: input.concurrency ?? 5,
      });

      if (input.retryPolicy) {
        const rp = input.retryPolicy;
        const retryPolicy = retryPolicyInputSchema.parse(rp);
        const savedRp = await this.repo.upsertDefaultRetryPolicyForProject(projectId, retryPolicy);
        const linked = await this.repo.linkQueueToRetryPolicy(queueId, savedRp.id);
        return { queue: toQueueDto(linked) };
      }

      return { queue: toQueueDto(created) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_QUEUE_NAME', 'Queue name already exists in this project');
      }
      throw error;
    }
  }

  async listQueues(projectId: string, user: { id: string }) {
    await this.assertProjectRole(user.id, projectId, [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]);
    const queues = await this.repo.findQueuesByProjectId(projectId);
    return { queues: queues.map((q) => toQueueDto(q)) };
  }

  async getQueueById(queueId: string, user: { id: string }) {
    const queue = await this.assertQueueRole(user.id, queueId, [
      MemberRole.OWNER,
      MemberRole.ADMIN,
      MemberRole.MEMBER,
    ]);

    return { queue: toQueueDto(queue) };
  }

  async updateQueue(queueId: string, input: UpdateQueueInput, user: { id: string }) {
    const queue = await this.assertQueueRole(user.id, queueId, [MemberRole.OWNER, MemberRole.ADMIN]);

    const data: any = {
      name: input.name,
      description: input.description,
      priority: input.priority,
      concurrency: input.concurrency,
      status: input.status,
    };

    // handle undefined vs null for description
    if (input.description === undefined) delete data.description;
    if (input.status === undefined) delete data.status;

    try {
      const updated = await this.repo.updateQueue(queueId, data);

      if (input.retryPolicy) {
        const retryPolicy = retryPolicyInputSchema.parse(input.retryPolicy);
        const savedRp = await this.repo.upsertDefaultRetryPolicyForProject(queue.projectId, retryPolicy);
        const linked = await this.repo.linkQueueToRetryPolicy(queueId, savedRp.id);
        return { queue: toQueueDto(linked) };
      }

      return { queue: toQueueDto(updated) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_QUEUE_NAME', 'Queue name already exists in this project');
      }
      throw error;
    }
  }

  async deleteQueue(queueId: string, user: { id: string }) {
    const queue = await this.assertQueueRole(user.id, queueId, [MemberRole.OWNER, MemberRole.ADMIN]);
    await this.repo.deleteQueueHard(queueId);
    return { message: 'Queue deleted successfully' };
  }

  async pauseQueue(queueId: string, user: { id: string }) {
    await this.assertQueueRole(user.id, queueId, [MemberRole.OWNER, MemberRole.ADMIN]);
    const paused = await this.repo.pauseQueue(queueId);
    return { queue: toQueueDto(paused) };
  }

  async resumeQueue(queueId: string, user: { id: string }) {
    await this.assertQueueRole(user.id, queueId, [MemberRole.OWNER, MemberRole.ADMIN]);
    const resumed = await this.repo.resumeQueue(queueId);
    return { queue: toQueueDto(resumed) };
  }
}

