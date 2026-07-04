import crypto from 'crypto';
import { Prisma } from '@job-scheduler/database';
import { MemberRole, JobStatus, JobType } from '@job-scheduler/database';
import { prisma } from '@job-scheduler/database';

import { AppError } from '../../auth/utils/app-error';
import { AuthRepository } from '../../auth/repositories/auth.repository';

import { JobRepository } from '../repositories/job.repository';
import { CreateJobInput, UpdateJobInput } from '../validators/job.validator';
import { JobDto, toJobDto } from '../dto/job.dto';

export class JobService {
  constructor(private readonly repo = new JobRepository()) {}

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

  private async resolveJobOrganizationId(jobId: string) {
    // Minimal ownership resolution without duplicating middleware
    const job = await this.repo.findJobById(jobId);
    if (!job) return null;

    // job has queue relation; queue has project; project has organization
    return job.queue?.project?.organizationId ?? null;
  }

  private async assertJobRole(userId: string, jobId: string, roles: MemberRole[]) {
    const orgId = await this.resolveJobOrganizationId(jobId);
    if (!orgId) {
      // Distinguish missing job vs missing org-chain
      const exists = await this.repo.existsJob(jobId);
      if (!exists) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');
      throw new AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    }

    const allowed = await new AuthRepository().userHasOrganizationRole(userId, orgId, roles);
    if (!allowed) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource');
    }
  }

  private computeJobType(input: CreateJobInput): JobType {
    // cronExpression takes precedence over other scheduling fields if present
    if (input.cronExpression) return JobType.RECURRING;
    if (input.scheduledTime) return JobType.SCHEDULED;
    if (typeof input.delay === 'number' && input.delay > 0) return JobType.DELAYED;
    if (input.batchId) return JobType.BATCH;
    return JobType.IMMEDIATE;
  }

  private computeInitialStatus(type: JobType): JobStatus {
    switch (type) {
      case JobType.IMMEDIATE:
        return JobStatus.QUEUED;
      case JobType.DELAYED:
        return JobStatus.DELAYED;
      case JobType.SCHEDULED:
        return JobStatus.SCHEDULED;
      case JobType.RECURRING:
        return JobStatus.SCHEDULED;
      case JobType.BATCH:
        return JobStatus.PENDING;
      default:
        return JobStatus.PENDING;
    }
  }

  private isTerminal(status: JobStatus): boolean {
    return (
      status === JobStatus.SUCCEEDED ||
      status === JobStatus.FAILED ||
      status === JobStatus.CANCELLED ||
      status === JobStatus.DEAD_LETTERED
    );
  }

  private canUpdate(status: JobStatus): boolean {
    return !this.isTerminal(status) && status !== JobStatus.RUNNING && status !== JobStatus.RETRYING;
  }

  private canCancel(status: JobStatus): boolean {
    return !this.isTerminal(status) && status !== JobStatus.RUNNING;
  }

  private canRetry(status: JobStatus): boolean {
    return status === JobStatus.FAILED || status === JobStatus.DEAD_LETTERED;
  }

  private resolveRunAt(input: CreateJobInput): Date {
    if (input.cronExpression) {
      // For cron/recurring jobs, actual schedule is handled by ScheduledJob; Job.runAt is set to now
      return new Date();
    }

    if (input.scheduledTime) return new Date(input.scheduledTime);

    if (typeof input.delay === 'number') {
      if (input.delay < 0) throw new AppError(400, 'INVALID_DELAY', 'Delay must be >= 0');
      return new Date(Date.now() + input.delay);
    }

    return new Date();
  }

  async createJob(queueId: string, input: CreateJobInput, user: { id: string }) {
    await this.assertQueueRole(user.id, queueId, [MemberRole.OWNER, MemberRole.ADMIN]);

    const queue = await this.repo.findQueueById(queueId);
    if (!queue) throw new AppError(404, 'QUEUE_NOT_FOUND', 'Queue not found');

    const projectId = queue.projectId;

    const jobId = crypto.randomUUID();
    const type = this.computeJobType(input);
    const status = this.computeInitialStatus(type);

    let retryPolicyId: string | null = null;
    if (input.retryPolicy) {
      const saved = await this.repo.upsertRetryPolicy(projectId, input.retryPolicy);
      retryPolicyId = saved.id;
    }

    let scheduledJobId: string | null = null;
    if (input.cronExpression) {
      const scheduled = await this.repo.upsertScheduledJobForCron({
        projectId,
        queueId,
        name: input.name,
        cronExpression: input.cronExpression,
        payload: input.payload,
        priority: input.priority,
        // Keep timezone default in Prisma model if not provided
        timezone: 'UTC',
        startAt: input.scheduledTime ? new Date(input.scheduledTime) : null,
      });
      scheduledJobId = scheduled.id;
    }

    // Job.payload is stored as JSON
    const job = await this.repo.createJob({
      id: jobId,
      projectId,
      queueId,
      retryPolicyId: retryPolicyId ?? undefined,
      scheduledJobId: scheduledJobId ?? undefined,
      type,
      name: input.name,
      payload: input.payload,
      status,
      priority: input.priority,
      runAt: this.resolveRunAt(input),
      batchKey: input.batchId ?? null,
    });

    return { job: toJobDto(job) as JobDto };
  }

  async listJobs(queueId: string, user: { id: string }) {
    await this.assertQueueRole(user.id, queueId, [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]);

    const jobs = await this.repo.findJobsByQueueId(queueId, {
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return { jobs: jobs.map((j: any) => toJobDto(j) as JobDto) };
  }


  async getJob(jobId: string, user: { id: string }) {
    const job = await this.repo.findJobById(jobId);
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    await this.assertJobRole(user.id, jobId, [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]);

    return { job: toJobDto(job) as JobDto };
  }

  async updateJob(jobId: string, input: UpdateJobInput, user: { id: string }) {
    const job = await this.repo.findJobById(jobId);
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    await this.assertJobRole(user.id, jobId, [MemberRole.OWNER, MemberRole.ADMIN]);

    if (!this.canUpdate(job.status)) {
      throw new AppError(
        409,
        'JOB_STATUS_NOT_UPDATABLE',
        `Job cannot be updated when status is ${job.status}`,
      );
    }

    let retryPolicyId: string | null | undefined = undefined;
    if (input.retryPolicy !== undefined) {
      if (input.retryPolicy === null) {
        retryPolicyId = null;
      } else {
        const saved = await this.repo.upsertRetryPolicy(job.projectId, input.retryPolicy);
        retryPolicyId = saved.id;
      }
    }

    let scheduledJobId: string | null | undefined = undefined;
    if (input.cronExpression !== undefined) {
      if (input.cronExpression === null) {
        scheduledJobId = null;
      } else {
        const scheduled = await this.repo.upsertScheduledJobForCron({
          projectId: job.projectId,
          queueId: job.queueId,
          name: input.name ?? job.name,
          cronExpression: input.cronExpression,
          payload: input.payload ?? job.payload,
          priority: input.priority ?? job.priority,
          timezone: 'UTC',
          startAt: input.scheduledTime ? new Date(input.scheduledTime) : null,
        });
        scheduledJobId = scheduled.id;
      }
    }

    const updated = await this.repo.updateJob(jobId, {
      name: input.name,
      payload: input.payload,
      priority: input.priority,
      retryPolicyId,
      scheduledJobId,
      runAt: input.scheduledTime ? new Date(input.scheduledTime) : undefined,
      batchKey: input.batchId ?? undefined,
      metadata: input.metadata,
    });

    return { job: toJobDto(updated) as JobDto };
  }

  async deleteJob(jobId: string, user: { id: string }) {
    const job = await this.repo.findJobById(jobId);
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    await this.assertJobRole(user.id, jobId, [MemberRole.OWNER, MemberRole.ADMIN]);

    if (job.status === JobStatus.RUNNING) {
      throw new AppError(409, 'JOB_STATUS_NOT_DELETABLE', 'Cannot delete a running job');
    }

    await this.repo.deleteJobHard(jobId);
    return { message: 'Job deleted successfully' };
  }

  async cancelJob(jobId: string, user: { id: string }) {
    const job = await this.repo.findJobById(jobId);
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    await this.assertJobRole(user.id, jobId, [MemberRole.OWNER, MemberRole.ADMIN]);

    if (!this.canCancel(job.status)) {
      throw new AppError(409, 'JOB_STATUS_NOT_CANCELLABLE', 'Job cannot be cancelled in its current state');
    }

    const updated = await this.repo.updateJob(jobId, { status: JobStatus.CANCELLED });
    return { job: toJobDto(updated) as JobDto };
  }

  async retryJob(jobId: string, input: { attemptCount?: number }, user: { id: string }) {
    const job = await this.repo.findJobById(jobId);
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    await this.assertJobRole(user.id, jobId, [MemberRole.OWNER, MemberRole.ADMIN]);

    if (!this.canRetry(job.status)) {
      throw new AppError(409, 'JOB_STATUS_NOT_RETRIABLE', 'Job cannot be retried in its current state');
    }

    const nextAttempt = (job.attemptCount ?? 0) + 1;

    const updated = await this.repo.updateJob(jobId, {
      status: JobStatus.RETRYING,
      attemptCount: nextAttempt,
      lastError: null,
      // If retryPolicy exists, actual delay is computed by worker later; for now set runAt to now
      runAt: new Date(),
    });

    return { job: toJobDto(updated) as JobDto };
  }
}

