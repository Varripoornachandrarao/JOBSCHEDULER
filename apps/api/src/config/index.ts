import dotenv from 'dotenv';
import path from 'path';

// Load .env files from standard paths
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/scheduler_db?schema=public',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key-for-development-only',
};
