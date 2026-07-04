import { Router } from 'express';
import { authenticate } from '../../auth/middleware/auth.middleware';
import { validateBody, validateParams } from '../../auth/middleware/validate-request';

import { createOrganizationSchema, paramsOrganizationIdSchema, updateOrganizationSchema } from '../validators/organization.validator';
import { OrganizationController } from '../controllers/organization.controller';


const router = Router();
const organizationController = new OrganizationController();

// All organization routes require authentication
router.use(authenticate);

router.post('/', validateBody(createOrganizationSchema), organizationController.create.bind(organizationController));
router.get('/', organizationController.list.bind(organizationController));
router.get('/:id', validateParams(paramsOrganizationIdSchema), organizationController.getById.bind(organizationController));
router.put('/:id', validateParams(paramsOrganizationIdSchema), validateBody(updateOrganizationSchema), organizationController.update.bind(organizationController));
router.delete('/:id', validateParams(paramsOrganizationIdSchema), organizationController.deleteById.bind(organizationController));

export { router as organizationRoutes };
