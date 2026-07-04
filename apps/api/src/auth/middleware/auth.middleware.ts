import { MemberRole } from '@job-scheduler/database';
import { NextFunction, Request, Response } from 'express';
import { AuthRepository } from '../repositories/auth.repository';
import { AppError } from '../utils/app-error';
import { verifyAccessToken } from '../utils/jwt';

const authRepository = new AuthRepository();

function getBearerToken(req: Request): string {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError(401, 'MISSING_TOKEN', 'Authorization token is required');
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'INVALID_TOKEN', 'Authorization header must use Bearer token format');
  }

  return token;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const payload = verifyAccessToken(getBearerToken(req));
    const user = await authRepository.findActiveUserById(payload.sub);

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authenticated user no longer exists');
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorizeOrganizationRoles(roles: MemberRole[], organizationIdSource: 'params' | 'body' = 'params') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required');
      }

      const organizationId = req[organizationIdSource]?.organizationId;

      if (!organizationId) {
        throw new AppError(400, 'ORGANIZATION_REQUIRED', 'Organization id is required for authorization');
      }

      const isAllowed = await authRepository.userHasOrganizationRole(req.user.id, organizationId, roles);

      if (!isAllowed) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
