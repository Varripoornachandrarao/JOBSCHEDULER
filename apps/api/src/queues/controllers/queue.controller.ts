import { Request, Response, NextFunction } from 'express';
import { QueueService } from '../services/queue.service';

const queueService = new QueueService();

export class QueueController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.createQueue(req.params.projectId, req.body, req.user!);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.listQueues(req.params.projectId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.getQueueById(req.params.queueId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.updateQueue(req.params.queueId, req.body, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.deleteQueue(req.params.queueId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.pauseQueue(req.params.queueId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async resume(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.resumeQueue(req.params.queueId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

