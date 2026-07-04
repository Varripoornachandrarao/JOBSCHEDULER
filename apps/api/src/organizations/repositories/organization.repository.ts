import { MemberRole, prisma } from '@job-scheduler/database';

export class OrganizationRepository {
  createOrganization(data: {
    id: string;
    name: string;
    slug: string;
  }) {
    return prisma.organization.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
      },
    });
  }

  updateOrganization(id: string, data: { name?: string; slug?: string }) {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  deleteOrganizationHard(id: string) {
    // Schema does not contain deletedAt; implement hard delete.
    return prisma.organization.delete({ where: { id } });
  }

  findOrganizationById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  }

  findOrganizationsByUser(userId: string) {
    return prisma.organizationMember.findMany({
      where: { userId },
      select: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  findUserOrganizationRole(userId: string, organizationId: string) {
    return prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      select: { role: true },
    });
  }

  async userHasRole(userId: string, organizationId: string, roles: MemberRole[]) {
    const membership = await this.findUserOrganizationRole(userId, organizationId);
    return Boolean(membership && roles.includes(membership.role));
  }

  async createOrganizationMember(data: {
    id: string;
    organizationId: string;
    userId: string;
    role: MemberRole;
  }) {
    return prisma.organizationMember.create({
      data: {
        id: data.id,
        organizationId: data.organizationId,
        userId: data.userId,
        role: data.role,
        joinedAt: new Date(),
      },
    });
  }
}

