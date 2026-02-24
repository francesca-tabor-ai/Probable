import { Redis } from "ioredis";

export function createQueueConnection(redisUrl: string) {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });
}
