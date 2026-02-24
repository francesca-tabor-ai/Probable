import { Queue, Worker } from "bullmq";
import { createQueueConnection } from "./connection.js";
import { processCreatorPayouts } from "../agents/creator-payout-reconciliation/index.js";
import type { Db } from "../db/index.js";

const PAYOUT_QUEUE = "payout";

export interface PayoutJobData {
  periodStart: string;
  periodEnd: string;
  creatorIds?: string[];
}

export function createPayoutQueue(redisUrl: string) {
  const connection = createQueueConnection(redisUrl);
  return new Queue<PayoutJobData>(PAYOUT_QUEUE, { connection });
}

export function createPayoutWorker(
  redisUrl: string,
  db: Db,
  handler?: (job: { data: PayoutJobData }) => Promise<void>
) {
  const connection = createQueueConnection(redisUrl);
  return new Worker<PayoutJobData>(
    PAYOUT_QUEUE,
    async (job) => {
      if (handler) {
        await handler(job);
      } else {
        await processCreatorPayouts(db, {
          periodStart: new Date(job.data.periodStart),
          periodEnd: new Date(job.data.periodEnd),
          creatorIds: job.data.creatorIds,
        });
      }
    },
    { connection }
  );
}
