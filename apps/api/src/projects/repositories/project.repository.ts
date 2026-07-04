import { prisma } from '@job-scheduler/database';

export class ProjectRepository {
  createProject(data: {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
    description?: string | null;
  }) {
    return prisma.project.create({
      data: {
        id: data.id,
        organizationId: data.organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });
  }

  updateProject(projectId: string, data: { name?: string; slug?: string; description?: string | null }) {
    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  deleteProjectHard(projectId: string) {
    return prisma.project.delete({ where: { id: projectId } });
  }

  findProjectById(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findProjectsByOrganizationId(organizationId: string) {
    return prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

