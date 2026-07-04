import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/app-error';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', result.error.flatten()),
      );
    }

    req.body = result.data;
    return next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Invalid path parameters', result.error.flatten()),
      );
    }

    // Merge validated params back (params is read-only in some versions, cast to any)
    Object.assign(req.params, result.data as Record<string, string>);
    return next();
  };
}
