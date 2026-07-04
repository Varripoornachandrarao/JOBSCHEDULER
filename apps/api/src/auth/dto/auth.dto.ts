import { AuthenticatedUser } from '../types/auth.types';

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  user: AuthenticatedUser;
  tokens: AuthTokensDto;
}

export interface CurrentUserDto {
  user: AuthenticatedUser;
}

export interface MessageResponseDto {
  message: string;
}
