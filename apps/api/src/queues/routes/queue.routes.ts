import { Router } from 'express';
import { authenticate } from '../../auth/middleware/auth.middleware';

import { validateBody, validateParams } from '../../auth/middleware/validate-request';

import {
  createQueueSchema,
  paramsProjectIdSchema,
  paramsQueueIdSchema,
  updateQueueSchema,
} from '../validators/queue.validator';
import { QueueController } from '../controllers/queue.controller';
import { MemberRole } from '@job-scheduler/database';
import { authorizeOrganizationRoles } from '../../auth/middleware/auth.middleware';


const router = Router();
const controller = new QueueController();

router.use(authenticate);

// POST   /api/projects/:projectId/queues
router.post(
  '/projects/:projectId/queues',
  validateParams(paramsProjectIdSchema),
  authorizeOrganizationRoles([MemberRole.OWNER, MemberRole.ADMIN], 'params'),
  validateBody(createQueueSchema),
  controller.create.bind(controller),
);

// GET    /api/projects/:projectId/queues
router.get(
  '/projects/:projectId/queues',
  validateParams(paramsProjectIdSchema),
  // authorizeOrganizationRoles expects req.params.organizationId; can't use projectId here.
  // Authorization is performed in the service layer.
  controller.list.bind(controller),
);

// GET    /api/queues/:queueId
router.get(
  '/queues/:queueId',
  validateParams(paramsQueueIdSchema),
  controller.getById.bind(controller),
);

// PUT    /api/queues/:queueId
router.put(
  '/queues/:queueId',
  validateParams(paramsQueueIdSchema),
  validateBody(updateQueueSchema),
  controller.update.bind(controller),
);

// DELETE /api/queues/:queueId
router.delete(
  '/queues/:queueId',
  validateParams(paramsQueueIdSchema),
  controller.deleteById.bind(controller),
);

// POST   /api/queues/:queueId/pause
router.post(
  '/queues/:queueId/pause',
  validateParams(paramsQueueIdSchema),
  controller.pause.bind(controller),
);

// POST   /api/queues/:queueId/resume
router.post(
  '/queues/:queueId/resume',
  validateParams(paramsQueueIdSchema),
  controller.resume.bind(controller),
);

export { router as queueRoutes };

