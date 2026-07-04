import { Request, Response, NextFunction } from 'express';
import { WorkerService } from '../services/worker.service';
import { parseBigIntFromUnknown, workerHeartbeatSchema, workerIdSchema, workerRegistrationSchema } from '../validators/worker.validator';

const workerService = new WorkerService();

export class WorkerController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = workerRegistrationSchema.parse(req.body);
      const result = await workerService.register(payload);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workerService.getAll();
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const workerId = workerIdSchema.parse(req.params.workerId);
      const result = await workerService.getById(workerId);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async heartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = workerHeartbeatSchema.parse(req.body);
      const result = await workerService.heartbeat({
        workerId: parsed.workerId,
        status: parsed.status,
        cpuUsagePercent: parsed.cpuUsagePercent,
        memoryUsageBytes: parseBigIntFromUnknown(parsed.memoryUsageBytes),
        activeJobsCount: parsed.activeJobsCount,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async offline(req: Request, res: Response, next: NextFunction) {
    try {
      const workerId = workerIdSchema.parse(req.params.workerId);
      const result = await workerService.offline(workerId);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

