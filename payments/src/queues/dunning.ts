import { Queue, Worker } from "bullmq";
import { createQueueConnection } from "./connection.js";

const DUNNING_QUEUE = "dunning";

export function createDunningQueue(redisUrl: string) {
  const connection = createQueueConnection(redisUrl);
  return new Queue(DUNNING_QUEUE, { connection });
}

export interface DunningJobData {
  subscriptionId: string;
  userId: string;
  retryCount: number;
  emailTemplate: string;
}

export function createDunningWorker(
  redisUrl: string,
  handler: (job: { data: DunningJobData }) => Promise<void>
) {
  const connection = createQueueConnection(redisUrl);
  return new Worker<DunningJobData>(
    DUNNING_QUEUE,
    async (job) => {
      await handler(job);
    },
    { connection }
  );
}
