import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../../config';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.types';
import { AppError } from './app-error';

function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new AppError(500, 'INVALID_TOKEN_EXPIRATION', 'JWT expiration configuration is invalid');
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

function signToken(payload: object, secret: string, expiresIn: string): string {
  // jsonwebtoken types allow `expiresIn` as string | number, but our `SignOptions` import
  // is stricter in this repo's TS config; casting keeps runtime behavior intact.
  const options = { expiresIn } as SignOptions;
  return jwt.sign(payload, secret, options);
}


function verifyToken<T extends JwtPayload>(token: string, secret: string, expectedType: string): T {
  try {
    const payload = jwt.verify(token, secret) as T;

    if (payload.type !== expectedType) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid token type');
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Token has expired');
    }

    throw new AppError(401, 'INVALID_TOKEN', 'Token is invalid');
  }
}

export function createAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return signToken({ ...payload, type: 'access' }, config.jwt.accessSecret, config.jwt.accessExpiresIn);
}

export function createRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  return signToken({ ...payload, type: 'refresh' }, config.jwt.refreshSecret, config.jwt.refreshExpiresIn);
}

export function verifyAccessToken(token: string): AccessTokenPayload & JwtPayload {
  return verifyToken<AccessTokenPayload & JwtPayload>(token, config.jwt.accessSecret, 'access');
}

export function verifyRefreshToken(token: string): RefreshTokenPayload & JwtPayload {
  return verifyToken<RefreshTokenPayload & JwtPayload>(token, config.jwt.refreshSecret, 'refresh');
}

export function getRefreshTokenExpiresAt(): Date {
  return new Date(Date.now() + parseDurationMs(config.jwt.refreshExpiresIn));
}
