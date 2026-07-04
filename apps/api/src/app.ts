import express from 'express';
import cors from 'cors';
import { prisma } from '@job-scheduler/database';
import helmet from 'helmet';

import { authRoutes } from './auth/routes/auth.routes';
import { organizationRoutes } from './organizations/routes/organization.routes';
import { projectRoutes } from './projects/routes/project.routes';
import { queueRoutes } from './queues/routes/queue.routes';
import { jobRoutes } from './jobs/routes/job.routes';


import { apiRateLimiter } from './middleware/rate-limiters';
import { requestLogger } from './middleware/request-logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { config } from './config';

const app = express();

// Security & request parsing
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());

// Logging & rate limiting
app.use(requestLogger);
app.use(apiRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api', projectRoutes);
app.use('/api', queueRoutes);
app.use('/api', jobRoutes);




// Base health check route

app.get('/health', async (req, res) => {
  try {
    // Verify Postgres database connection status
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'UP',
      services: {
        database: 'CONNECTED',
        api: 'OK',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'DOWN',
      services: {
        database: 'DISCONNECTED',
        api: 'OK',
      },
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 & centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };

