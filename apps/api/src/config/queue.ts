import { Queue } from 'bullmq';
import { config } from './index';

const queues: Record<string, Queue> = {};

/**
 * Gets or creates a BullMQ Queue instance.
 * Reuses connections and queue objects to avoid leakage.
 */
export function getQueue(queueName: string): Queue {
  if (!queues[queueName]) {
    queues[queueName] = new Queue(queueName, {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        maxRetriesPerRequest: null, // Required by BullMQ
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return queues[queueName];
}

