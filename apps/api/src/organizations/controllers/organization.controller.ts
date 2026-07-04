import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service';

const organizationService = new OrganizationService();

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.createOrganization(req.body, req.user!);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.listMyOrganizations(req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getOrganizationById(req.params.id, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.updateOrganization(req.params.id, req.body, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.deleteOrganization(req.params.id, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

