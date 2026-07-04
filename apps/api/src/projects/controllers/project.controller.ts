import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.createProject(req.params.organizationId, req.body, req.user!);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.listProjects(req.params.organizationId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.getProject(req.params.projectId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.updateProject(req.params.projectId, req.body, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.deleteProject(req.params.projectId, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

