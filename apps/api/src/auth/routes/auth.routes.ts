import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate-request';
import { loginSchema, logoutSchema, refreshTokenSchema, registerSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

router.post('/register', validateBody(registerSchema), authController.register.bind(authController));
router.post('/login', validateBody(loginSchema), authController.login.bind(authController));
router.post('/refresh', validateBody(refreshTokenSchema), authController.refresh.bind(authController));
router.post('/logout', authenticate, validateBody(logoutSchema), authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

export { router as authRoutes };
