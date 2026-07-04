import { Router } from 'express';
import { MemberRole } from '@job-scheduler/database';

import { authenticate, authorizeOrganizationRoles } from '../../auth/middleware/auth.middleware';

import { validateBody, validateParams } from '../../auth/middleware/validate-request';

import { createProjectSchema, paramsOrganizationIdSchema, paramsProjectIdSchema, updateProjectSchema } from '../validators/project.validator';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const controller = new ProjectController();

// All routes require authentication
router.use(authenticate);

// /api/organizations/:organizationId/projects
router.post(
  '/organizations/:organizationId/projects',
  validateParams(paramsOrganizationIdSchema),
  authorizeOrganizationRoles([MemberRole.OWNER, MemberRole.ADMIN]),
  validateBody(createProjectSchema),
  controller.create.bind(controller),
);

router.get(
  '/organizations/:organizationId/projects',
  validateParams(paramsOrganizationIdSchema),
  authorizeOrganizationRoles([MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]),
  controller.list.bind(controller),
);

// /api/projects/:projectId
router.get(
  '/projects/:projectId',
  validateParams(paramsProjectIdSchema),
  // Authorization is done in the service after resolving organizationId
  controller.getById.bind(controller),
);

router.put(
  '/projects/:projectId',
  validateParams(paramsProjectIdSchema),
  validateBody(updateProjectSchema),
  controller.update.bind(controller),
);

router.delete(
  '/projects/:projectId',
  validateParams(paramsProjectIdSchema),
  controller.deleteById.bind(controller),
);

export { router as projectRoutes };

