import Redis from 'ioredis';
import { config } from './index';

export const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('connect', () => {
  console.log('Successfully connected to Redis server');
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});
