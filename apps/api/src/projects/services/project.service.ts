import crypto from 'crypto';
import { MemberRole, Prisma } from '@job-scheduler/database';

import { AuthRepository } from '../../auth/repositories/auth.repository';

import { AppError } from '../../auth/utils/app-error';

import { ProjectRepository } from '../repositories/project.repository';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';
import {
  MessageResponseDto,
  ProjectDto,
  ProjectListDto,
  ProjectResponseDto,
  toProjectDto,
} from '../dto/project.dto';
import { AuthenticatedUser } from '../../auth/types/auth.types';

export class ProjectService {
  constructor(private readonly repo = new ProjectRepository()) {}

  private toSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async assertOrgRole(
    user: AuthenticatedUser,
    organizationId: string,
    roles: MemberRole[],
  ): Promise<void> {
    const authRepository = new AuthRepository();
    const allowed = await authRepository.userHasOrganizationRole(user.id, organizationId, roles);

    if (!allowed) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource');
    }
  }

  async createProject(
    organizationId: string,
    input: CreateProjectInput,
    user: AuthenticatedUser,
  ): Promise<ProjectResponseDto> {
    await this.assertOrgRole(user, organizationId, [MemberRole.OWNER, MemberRole.ADMIN]);

    const projectId = crypto.randomUUID();
    const slug = this.toSlug(input.name);

    try {
      const project = await this.repo.createProject({
        id: projectId,
        organizationId,
        name: input.name,
        slug,
        description: input.description ?? null,
      });

      return { project: toProjectDto(project) as ProjectDto };
    } catch (error) {
      // Prisma unique constraint on (organizationId, slug)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_PROJECT_SLUG', 'Project slug already exists in this organization');
      }
      throw error;
    }
  }

  async listProjects(organizationId: string, user: AuthenticatedUser): Promise<ProjectListDto> {
    await this.assertOrgRole(user, organizationId, [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]);

    const projects = await this.repo.findProjectsByOrganizationId(organizationId);
    return { projects: projects as ProjectDto[] };
  }

  async getProject(projectId: string, user: AuthenticatedUser): Promise<ProjectResponseDto> {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    await this.assertOrgRole(user, project.organizationId, [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]);

    return { project: toProjectDto(project) as ProjectDto };
  }

  async updateProject(
    projectId: string,
    input: UpdateProjectInput,
    user: AuthenticatedUser,
  ): Promise<ProjectResponseDto> {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    await this.assertOrgRole(user, project.organizationId, [MemberRole.OWNER, MemberRole.ADMIN]);

    const data: { name?: string; slug?: string; description?: string | null } = {};

    if (input.name !== undefined) {
      data.name = input.name;
      data.slug = this.toSlug(input.name);
    }

    if (input.description !== undefined) {
      data.description = input.description ?? null;
    }

    try {
      const updated = await this.repo.updateProject(projectId, data);
      return { project: toProjectDto(updated) as ProjectDto };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_PROJECT_SLUG', 'Project slug already exists in this organization');
      }
      throw error;
    }
  }

  async deleteProject(projectId: string, user: AuthenticatedUser): Promise<MessageResponseDto> {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    }

    await this.assertOrgRole(user, project.organizationId, [MemberRole.OWNER]);

    await this.repo.deleteProjectHard(projectId);
    return { message: 'Project deleted successfully' };
  }
}

