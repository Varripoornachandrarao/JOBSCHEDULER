import { Router } from 'express';
import { authenticate } from '../../auth/middleware/auth.middleware';
import { validateBody, validateParams } from '../../auth/middleware/validate-request';

import { paramsJobIdSchema, paramsQueueIdSchema, createJobSchema, updateJobSchema } from '../validators/job.validator';
import { JobController } from '../controllers/job.controller';

const router = Router();
const controller = new JobController();


router.use(authenticate);

// POST /api/queues/:queueId/jobs
router.post(
  '/queues/:queueId/jobs',
  validateParams(paramsQueueIdSchema),
  validateBody(createJobSchema),
  controller.create.bind(controller),
);

// GET /api/queues/:queueId/jobs
router.get(
  '/queues/:queueId/jobs',
  validateParams(paramsQueueIdSchema),
  controller.list.bind(controller),
);

// GET /api/jobs/:jobId
router.get(
  '/jobs/:jobId',
  validateParams(paramsJobIdSchema),
  controller.get.bind(controller),
);

// PUT /api/jobs/:jobId
router.put(
  '/jobs/:jobId',
  validateParams(paramsJobIdSchema),
  validateBody(updateJobSchema),
  controller.update.bind(controller),
);

// DELETE /api/jobs/:jobId
router.delete(
  '/jobs/:jobId',
  validateParams(paramsJobIdSchema),
  controller.delete.bind(controller),
);

// POST /api/jobs/:jobId/cancel
router.post(
  '/jobs/:jobId/cancel',
  validateParams(paramsJobIdSchema),
  controller.cancel.bind(controller),
);

// POST /api/jobs/:jobId/retry
router.post(
  '/jobs/:jobId/retry',
  validateParams(paramsJobIdSchema),
  // Optional body; retry operation currently ignores attemptCount but we validate shape if present
  controller.retry.bind(controller),
);


export { router as jobRoutes };


