import { MemberRole } from '@job-scheduler/database';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  type: 'refresh';
}

export interface AuthRequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface OrganizationRoleCheck {
  organizationId: string;
  roles: MemberRole[];
}
