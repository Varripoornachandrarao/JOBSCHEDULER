import os from 'os';
import { WorkerStatus } from '@job-scheduler/database';
import { prisma } from '@job-scheduler/database';

export class WorkerRepository {
  async registerWorker(data: {
    projectId: string;
    queueId: string | null;
    name: string;
    hostname: string;
    ipAddress: string | null;
  }): Promise<string> {
    const worker = await prisma.worker.create({
      data: {
        projectId: data.projectId,
        queueId: data.queueId ?? null,
        name: data.name,
        hostname: data.hostname,
        ipAddress: data.ipAddress,
        status: WorkerStatus.STARTING,
        // startedAt/stoppedAt handled by schema defaults
      },
      select: { id: true },
    });
    return worker.id;
  }

  async setHeartbeatAndStatus(input: {
    workerId: string;
    status: WorkerStatus;
    lastHeartbeatAt: Date;
    heartbeatCpuUsagePercent: number;
    heartbeatMemoryUsageBytes: bigint;
    activeJobsCount: number;
  }) {
    await prisma.$transaction([
      prisma.worker.update({
        where: { id: input.workerId },
        data: {
          status: input.status,
          lastHeartbeatAt: input.lastHeartbeatAt,
        },
        select: { id: true },
      }),
      prisma.workerHeartbeat.create({
        data: {
          workerId: input.workerId,
          status: input.status,
          cpuUsagePercent: input.heartbeatCpuUsagePercent,
          memoryUsageBytes: input.heartbeatMemoryUsageBytes,
          activeJobsCount: input.activeJobsCount,
        },
      }),
    ]);
  }

  async setOffline(workerId: string) {
    await prisma.worker.update({
      where: { id: workerId },
      data: {
        status: WorkerStatus.TERMINATED,
        stoppedAt: new Date(),
        lastHeartbeatAt: new Date(),
      },
    });
  }
}

