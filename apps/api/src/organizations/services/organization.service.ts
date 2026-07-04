import crypto from 'crypto';
import { MemberRole, Prisma } from '@job-scheduler/database';

import { AppError } from '../../auth/utils/app-error';

import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationInput, UpdateOrganizationInput } from '../validators/organization.validator';
import {
  MessageResponseDto,
  OrganizationDto,
  OrganizationListDto,
  OrganizationResponseDto,
  toOrganizationDto,
} from '../dto/organization.dto';
import { AuthenticatedUser } from '../../auth/types/auth.types';



export class OrganizationService {
  constructor(private readonly repo = new OrganizationRepository()) {}

  private toSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }



  async createOrganization(input: CreateOrganizationInput, user: AuthenticatedUser): Promise<OrganizationResponseDto> {
    const orgId = crypto.randomUUID();

    const slug = this.toSlug(input.name);


    try {
      // NOTE: Organization model has no description column. description from input is silently ignored.
      const org = await this.repo.createOrganization({
        id: orgId,
        name: input.name,
        slug,
      });

      await this.repo.createOrganizationMember({
        id: crypto.randomUUID(),
        organizationId: org.id,
        userId: user.id,
        role: MemberRole.OWNER,
      });

      return { organization: toOrganizationDto(org) as OrganizationDto };
    } catch (error) {
      // Prisma unique constraint on slug
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_ORGANIZATION', 'Organization slug already exists');
      }
      throw error;
    }
  }

  async listMyOrganizations(user: AuthenticatedUser): Promise<OrganizationListDto> {
    const memberships = await this.repo.findOrganizationsByUser(user.id);
    const organizations = memberships.map((m) => m.organization);
    return { organizations: organizations as OrganizationDto[] };
  }

  async getOrganizationById(id: string, user: AuthenticatedUser): Promise<OrganizationResponseDto> {
    const org = await this.repo.findOrganizationById(id);

    if (!org) {
      throw new AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    }

    const isMember = await this.repo.userHasRole(user.id, id, [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]);

    if (!isMember) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this organization');
    }

    return { organization: toOrganizationDto(org) as OrganizationDto };
  }

  async updateOrganization(
    id: string,
    input: UpdateOrganizationInput,
    user: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const allowed = await this.repo.userHasRole(user.id, id, [MemberRole.OWNER, MemberRole.ADMIN]);

    if (!allowed) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this organization');
    }

    const org = await this.repo.findOrganizationById(id);
    if (!org) {
      throw new AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    }

    const data: { name?: string; slug?: string } = {};
    if (input.name !== undefined) {
      data.name = input.name;
      data.slug = this.toSlug(input.name);
    }


    const updated = await this.repo.updateOrganization(id, data);
    return { organization: toOrganizationDto(updated) as OrganizationDto };
  }

  async deleteOrganization(id: string, user: AuthenticatedUser): Promise<MessageResponseDto> {
    const allowed = await this.repo.userHasRole(user.id, id, [MemberRole.OWNER]);

    if (!allowed) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this organization');
    }

    const org = await this.repo.findOrganizationById(id);
    if (!org) {
      throw new AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    }

    await this.repo.deleteOrganizationHard(id);
    return { message: 'Organization deleted successfully' };
  }
}

