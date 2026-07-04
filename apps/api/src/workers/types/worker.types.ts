import { WorkerStatus } from '@job-scheduler/database';

export type WorkerStatusDto = keyof typeof WorkerStatus | WorkerStatus;

