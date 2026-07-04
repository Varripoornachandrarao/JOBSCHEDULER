import { Router } from 'express';
import { WorkerController } from '../controllers/worker.controller';

export const workerRoutes = Router();
const controller = new WorkerController();

// NOTE: Worker lifecycle endpoints are public for Phase 7 orchestration.
workerRoutes.get('/workers', (req, res, next) => controller.list(req, res, next));
workerRoutes.get('/workers/:workerId', (req, res, next) => controller.getById(req, res, next));


workerRoutes.post('/workers/register', (req, res, next) => controller.register(req, res, next));
workerRoutes.post('/workers/:workerId/heartbeat', (req, res, next) => controller.heartbeat(req, res, next));
workerRoutes.delete('/workers/:workerId', (req, res, next) => controller.offline(req, res, next));

