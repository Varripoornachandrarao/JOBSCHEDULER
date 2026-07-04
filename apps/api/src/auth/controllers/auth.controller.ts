import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

function getRequestContext(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  };
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body, getRequestContext(req));
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body, getRequestContext(req));
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.getCurrentUser(req.user!.id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refresh(req.body.refreshToken, getRequestContext(req));
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.logout(req.user!.id, req.body.refreshToken);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
