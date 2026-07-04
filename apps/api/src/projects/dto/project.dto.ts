export interface ProjectDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toProjectDto(org: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}): ProjectDto {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description,
    organizationId: org.organizationId,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

export interface ProjectListDto {
  projects: ProjectDto[];
}

export interface ProjectResponseDto {
  project: ProjectDto;
}

export interface MessageResponseDto {
  message: string;
}

