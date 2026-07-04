import { JobLogLevel, JobStatus } from '@job-scheduler/database';
import { JobLogRepository } from '../repositories/jobLog.repository';

export class GenericJobProcessor {
  constructor(private deps: { jobLogRepo: JobLogRepository }) {}

  async process(data: {
    jobId: string;
    jobName: string | undefined;
    payload: any;
    executionId: string;
    workerId: string;
  }): Promise<any> {
    // Generic processor (Phase 7):
    // - Do NOT hardcode job names.
    // - Current system stores payload as Json; we treat payload as an executable spec:
    //   { handler: string, input: any } OR just { ... }.
    // - If no handler is provided, simply echo payload.

    await this.deps.jobLogRepo.writeLog({
      jobId: data.jobId,
      executionId: data.executionId,
      level: JobLogLevel.DEBUG,
      message: 'Generic processor invoked',
      metadata: { jobName: data.jobName },
    });

    const payload = data.payload ?? {};
    const handler = payload?.handler;
    const input = payload?.input ?? payload;

    if (!handler) {
      await this.deps.jobLogRepo.writeLog({
        jobId: data.jobId,
        executionId: data.executionId,
        level: JobLogLevel.INFO,
        message: 'No handler specified; echoing payload',
      });
      return { ok: true, echoed: input };
    }

    // No hardcoded job names; allow a generic dispatch by handler string.
    // For Phase 7 we only support a safe allowlist of handler categories.
    // If handler is unknown, throw to mark failure.
    switch (handler) {
      case 'echo':
        return { ok: true, echoed: input };
      default:
        throw new Error(`Unknown job handler: ${handler}`);
    }
  }
}

