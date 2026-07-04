import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(3, 'Project name must be at least 3 characters').max(100),
  description: z.string().trim().max(500).optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(3, 'Project name must be at least 3 characters').max(100).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.name !== undefined || v.description !== undefined, {
    message: 'At least one field (name, description) is required to update',
  });

export const paramsOrganizationIdSchema = z.object({
  organizationId: z.string().uuid('Organization id must be a valid UUID'),
});

export const paramsProjectIdSchema = z.object({
  projectId: z.string().uuid('Project id must be a valid UUID'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ParamsOrganizationIdInput = z.infer<typeof paramsOrganizationIdSchema>;
export type ParamsProjectIdInput = z.infer<typeof paramsProjectIdSchema>;

