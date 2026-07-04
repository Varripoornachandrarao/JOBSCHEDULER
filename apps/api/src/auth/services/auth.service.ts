import crypto from 'crypto';
import { Prisma } from '@job-scheduler/database';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthResponseDto, CurrentUserDto, MessageResponseDto } from '../dto/auth.dto';
import { AuthRequestContext, AuthenticatedUser } from '../types/auth.types';
import { LoginInput, RegisterInput } from '../validators/auth.validator';
import { AppError } from '../utils/app-error';
import { hashPassword, verifyPassword } from '../utils/password';
import { hashToken } from '../utils/token';
import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiresAt,
  verifyRefreshToken,
} from '../utils/jwt';

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async register(input: RegisterInput, context: AuthRequestContext): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, 'DUPLICATE_EMAIL', 'An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    try {
      const user = await this.authRepository.createUser({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      });

      return this.createAuthResponse(this.toAuthenticatedUser(user), context);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_EMAIL', 'An account with this email already exists');
      }

      throw error;
    }
  }

  async login(input: LoginInput, context: AuthRequestContext): Promise<AuthResponseDto> {
    const user = await this.authRepository.findUserByEmail(input.email);

    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    await this.authRepository.updateLastLogin(user.id);

    return this.createAuthResponse(this.toAuthenticatedUser(user), context);
  }

  async getCurrentUser(userId: string): Promise<CurrentUserDto> {
    const user = await this.authRepository.findActiveUserById(userId);

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authenticated user no longer exists');
    }

    return {
      user: this.toAuthenticatedUser(user),
    };
  }

  async refresh(refreshToken: string, context: AuthRequestContext): Promise<AuthResponseDto> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const storedToken = await this.authRepository.findActiveRefreshToken(tokenHash);

    if (!storedToken || storedToken.id !== payload.tokenId || storedToken.userId !== payload.sub) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid');
    }

    if (!storedToken.user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'User account is inactive');
    }

    const user = this.toAuthenticatedUser(storedToken.user);
    const newTokenId = crypto.randomUUID();
    const tokens = await this.createTokenPair(user, context, newTokenId);
    await this.authRepository.revokeRefreshToken(storedToken.id, newTokenId);

    return {
      user,
      tokens,
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<MessageResponseDto> {
    if (!refreshToken) {
      await this.authRepository.revokeUserRefreshTokens(userId);
      return { message: 'Logged out successfully' };
    }

    const payload = verifyRefreshToken(refreshToken);

    if (payload.sub !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Refresh token does not belong to the authenticated user');
    }

    const storedToken = await this.authRepository.findActiveRefreshToken(hashToken(refreshToken));

    if (storedToken) {
      await this.authRepository.revokeRefreshToken(storedToken.id);
    }

    return { message: 'Logged out successfully' };
  }

  private async createAuthResponse(user: AuthenticatedUser, context: AuthRequestContext): Promise<AuthResponseDto> {
    return {
      user,
      tokens: await this.createTokenPair(user, context),
    };
  }

  private async createTokenPair(
    user: AuthenticatedUser,
    context: AuthRequestContext,
    refreshTokenId = crypto.randomUUID(),
  ) {
    const accessToken = createAccessToken({
      sub: user.id,
      email: user.email,
    });
    const refreshToken = createRefreshToken({
      sub: user.id,
      tokenId: refreshTokenId,
    });

    await this.authRepository.createRefreshToken({
      id: refreshTokenId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiresAt(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private toAuthenticatedUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
