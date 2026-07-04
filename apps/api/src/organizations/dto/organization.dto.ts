export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toOrganizationDto(org: {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}): OrganizationDto {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

export interface OrganizationListDto {
  organizations: OrganizationDto[];
}

export interface OrganizationResponseDto {
  organization: OrganizationDto;
}

export interface MessageResponseDto {
  message: string;
}
