import dotenv from 'dotenv';
import path from 'path';
// Load environment variables before any other imports
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import { redisConnection } from './config/redis';
import { prisma } from '@job-scheduler/database';


async function bootstrap() {
  console.log('[Worker] Starting worker container environment verification...');
  
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('[Worker] PostgreSQL connection check passed.');
    
    // Check Redis connection
    await redisConnection.ping();
    console.log('[Worker] Redis connection check passed.');
    
    console.log('[Worker] Worker service registered and ready.');
  } catch (error) {
    console.error('[Worker] Readiness check failed:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', () => {
  console.log('[Worker] SIGTERM received. Gracefully cleaning connection pools...');
  redisConnection.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Worker] SIGINT received. Gracefully cleaning connection pools...');
  redisConnection.disconnect();
  process.exit(0);
});
