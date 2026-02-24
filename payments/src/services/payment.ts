import type { Db } from "../db/index.js";
import { transactions } from "../db/schema.js";
import { eq } from "drizzle-orm";

export function createPaymentService(db: Db) {
  return {
    async createTransaction(data: {
      userId: string;
      amount: string;
      currency: string;
      status: "pending" | "succeeded" | "failed";
      gateway: string;
      gatewayTxnId?: string;
      gatewayEventId?: string;
      subscriptionId?: string;
      metadata?: Record<string, unknown>;
    }) {
      const [txn] = await db
        .insert(transactions)
        .values(data)
        .returning();
      return txn;
    },

    async getByGatewayEventId(gateway: string, eventId: string) {
      const [txn] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.gatewayEventId, eventId))
        .limit(1);
      return txn ?? null;
    },
  };
}
