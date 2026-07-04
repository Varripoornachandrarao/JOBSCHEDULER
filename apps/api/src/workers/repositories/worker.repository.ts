import { prisma } from '@job-scheduler/database';
import { WorkerStatus } from '@job-scheduler/database';

export class WorkerRepository {
  async registerWorker(data: {
    projectId: string;
    queueId: string | null;
    name: string;
    hostname: string;
    ipAddress: string | null;
    concurrencyLimit?: number;
  }) {
    // Uniqueness constraint: (projectId, name)
    const worker = await prisma.worker.upsert({
      where: { projectId_name: { projectId: data.projectId, name: data.name } },
      update: {
        queueId: data.queueId,
        hostname: data.hostname,
        ipAddress: data.ipAddress,
        status: WorkerStatus.STARTING,
        concurrencyLimit: data.concurrencyLimit ?? undefined,
      },
      create: {
        projectId: data.projectId,
        queueId: data.queueId,
        name: data.name,
        hostname: data.hostname,
        ipAddress: data.ipAddress,
        concurrencyLimit: data.concurrencyLimit ?? 5,
        status: WorkerStatus.STARTING,
      },
    });

    return worker;
  }

  async setHeartbeat(data: {
    workerId: string;
    status: WorkerStatus;
    cpuUsagePercent: number;
    memoryUsageBytes: bigint;
    activeJobsCount: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.worker.update({
        where: { id: data.workerId },
        data: {
          status: data.status,
          lastHeartbeatAt: new Date(),
        },
      });

      const heartbeat = await tx.workerHeartbeat.create({
        data: {
          workerId: data.workerId,
          status: data.status,
          cpuUsagePercent: data.cpuUsagePercent,
          memoryUsageBytes: data.memoryUsageBytes,
          activeJobsCount: data.activeJobsCount,
        },
      });

      return { worker: updated, heartbeat };
    });
  }

  async findAll() {
    return prisma.worker.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(workerId: string) {
    return prisma.worker.findUnique({ where: { id: workerId } });
  }

  async setOffline(workerId: string) {
    return prisma.worker.update({
      where: { id: workerId },
      data: {
        status: WorkerStatus.TERMINATED,
        stoppedAt: new Date(),
        lastHeartbeatAt: new Date(),
      },
    });
  }
}

