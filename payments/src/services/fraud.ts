import type { Db } from "../db/index.js";
import { transactions } from "../db/schema.js";
import { eq, and, gte } from "drizzle-orm";

export interface FraudCheckInput {
  userId: string;
  amount: number;
  currency: string;
  ipAddress?: string;
  userAgent?: string;
  paymentMethodId?: string;
  metadata?: Record<string, unknown>;
}

export interface FraudRule {
  name: string;
  check: (input: FraudCheckInput, context: FraudContext) => number;
}

export interface FraudContext {
  recentTransactionCount: number;
  failedAttemptCount: number;
  lastTransactionAmount?: number;
  lastTransactionIp?: string;
}

export function createFraudService(db: Db) {
  return {
    async getContext(userId: string, since: Date): Promise<FraudContext> {
      const txns = await db
        .select()
        .from(transactions)
        .where(
          and(eq(transactions.userId, userId), gte(transactions.createdAt, since))
        );

      const recent = txns;
      const succeeded = recent.filter((t) => t.status === "succeeded");
      const failed = recent.filter((t) => t.status === "failed");
      const lastTxn = recent.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        recentTransactionCount: recent.length,
        failedAttemptCount: failed.length,
        lastTransactionAmount: lastTxn
          ? parseFloat(lastTxn.amount)
          : undefined,
        lastTransactionIp: (lastTxn?.metadata as Record<string, unknown>)
          ?.ipAddress as string | undefined,
      };
    },
  };
}
