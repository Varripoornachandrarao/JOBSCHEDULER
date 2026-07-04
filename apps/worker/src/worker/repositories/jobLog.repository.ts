import { JobLogLevel } from '@job-scheduler/database';
import { prisma } from '@job-scheduler/database';

export class JobLogRepository {
  async writeLog(data: {
    jobId: string;
    executionId: string | null;
    level: JobLogLevel;
    message: string;
    metadata?: any;
  }) {
    await prisma.jobLog.create({
      data: {
        jobId: data.jobId,
        executionId: data.executionId,
        level: data.level,
        message: data.message,
        metadata: data.metadata ?? undefined,
      },
    });
  }
}

