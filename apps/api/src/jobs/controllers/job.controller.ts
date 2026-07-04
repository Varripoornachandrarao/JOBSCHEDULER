import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';

const jobService = new JobService();

export class JobController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.createJob(req.params.queueId, req.body, req.user!);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.listJobs(req.params.queueId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.getJob(req.params.jobId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.updateJob(req.params.jobId, req.body, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.deleteJob(req.params.jobId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.cancelJob(req.params.jobId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async retry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.retryJob(req.params.jobId, req.body, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

