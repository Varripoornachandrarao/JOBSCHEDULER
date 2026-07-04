import { JobExecution, JobStatus } from '@job-scheduler/database';
import { prisma } from '@job-scheduler/database';

export class JobExecutionRepository {
  async createExecution(data: {
    jobId: string;
    workerId: string;
    attempt: number;
    status: JobStatus;
  }) {
    return prisma.jobExecution.create({
      data: {
        jobId: data.jobId,
        workerId: data.workerId,
        attempt: data.attempt,
        status: data.status,
        startedAt: new Date(),
      },
      select: { id: true },
    });
  }

  async markStarted(executionId: string) {
    // startedAt already set by create, keep explicit update for safety.
    await prisma.jobExecution.update({
      where: { id: executionId },
      data: { status: 'RUNNING' as any },
    });
  }

  async completeExecution(data: {
    executionId: string;
    status: JobStatus;
  }) {
    await prisma.jobExecution.update({
      where: { id: data.executionId },
      data: {
        status: data.status,
        finishedAt: new Date(),
        durationMs: undefined,
      },
    });
  }

  async failExecution(data: {
    executionId: string;
    status: JobStatus;
    errorMessage: string;
    stackTrace?: string;
  }) {
    await prisma.jobExecution.update({
      where: { id: data.executionId },
      data: {
        status: data.status,
        finishedAt: new Date(),
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace ?? null,
      },
    });
  }
}

