import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(3, 'Organization name must be at least 3 characters').max(100),
  description: z.string().trim().max(500).optional(),
});

export const updateOrganizationSchema = z
  .object({
    name: z.string().trim().min(3, 'Organization name must be at least 3 characters').max(100).optional(),
  })
  .refine((v) => v.name !== undefined, {
    message: 'At least one field (name) is required to update',
  });

export const paramsOrganizationIdSchema = z.object({
  id: z.string().uuid('Organization id must be a valid UUID'),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type ParamsOrganizationIdInput = z.infer<typeof paramsOrganizationIdSchema>;

