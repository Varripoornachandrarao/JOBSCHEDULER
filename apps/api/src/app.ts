import express from 'express';
import cors from 'cors';
import { prisma } from '@job-scheduler/database';

const app = express();

app.use(cors());
app.use(express.json());

// Base health check route
app.get('/health', async (req, res) => {
  try {
    // Verify Postgres database connection status
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'UP',
      services: {
        database: 'CONNECTED',
        api: 'OK'
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'DOWN',
      services: {
        database: 'DISCONNECTED',
        api: 'OK'
      },
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export { app };
