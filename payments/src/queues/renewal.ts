import { Queue, Worker } from "bullmq";
import { createQueueConnection } from "./connection.js";

const RENEWAL_QUEUE = "renewal";

export function createRenewalQueue(redisUrl: string) {
  const connection = createQueueConnection(redisUrl);
  return new Queue(RENEWAL_QUEUE, { connection });
}

export interface RenewalJobData {
  subscriptionId: string;
  userId: string;
  periodEnd: Date;
}

export function createRenewalWorker(
  redisUrl: string,
  handler: (job: { data: RenewalJobData }) => Promise<void>
) {
  const connection = createQueueConnection(redisUrl);
  return new Worker<RenewalJobData>(
    RENEWAL_QUEUE,
    async (job) => {
      await handler(job);
    },
    { connection }
  );
}
