import type { Db } from "../db/index.js";
import {
  payoutRecords,
  creators,
  transactions,
  contentCreatorAssignments,
} from "../db/schema.js";
import { eq, and, gte, lte } from "drizzle-orm";

export function createPayoutService(db: Db) {
  return {
    async getCreatorEarnings(
      creatorId: string,
      periodStart: Date,
      periodEnd: Date
    ) {
      const [creator] = await db
        .select()
        .from(creators)
        .where(eq(creators.id, creatorId))
        .limit(1);
      if (!creator) return null;

      const assignments = await db
        .select()
        .from(contentCreatorAssignments)
        .where(eq(contentCreatorAssignments.creatorId, creatorId));

      const creatorTxns = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.status, "succeeded"),
            gte(transactions.createdAt, periodStart),
            lte(transactions.createdAt, periodEnd)
          )
        );

      const feePercent = parseFloat(creator.platformFeePercent);
      let gross = 0;
      for (const txn of creatorTxns) {
        const meta = (txn.metadata ?? {}) as Record<string, unknown>;
        const directCreatorId = meta.creatorId as string | undefined;
        if (directCreatorId === creatorId) {
          gross += parseFloat(txn.amount);
        } else {
          const contentId = meta.contentId as string | undefined;
          const assignment = assignments.find((a) => a.contentId === contentId);
          if (assignment) {
            const share = parseFloat(assignment.sharePercent) / 100;
            gross += parseFloat(txn.amount) * share;
          }
        }
      }
      const platformFee = gross * (feePercent / 100);
      const net = gross - platformFee;

      return {
        creatorId,
        periodStart,
        periodEnd,
        grossEarnings: gross,
        platformFee,
        netPayout: net,
      };
    },

    async createPayoutRecord(data: {
      creatorId: string;
      amount: string;
      grossEarnings: string;
      platformFee: string;
      periodStart: Date;
      periodEnd: Date;
      status?: "pending" | "initiated" | "completed" | "failed";
    }) {
      const [record] = await db
        .insert(payoutRecords)
        .values(data)
        .returning();
      return record;
    },

    async getEligibleCreators(
      periodStart: Date,
      periodEnd: Date,
      minPayout: number
    ) {
      const allCreators = await db.select().from(creators);
      const eligible = [];
      for (const creator of allCreators) {
        const earnings = await this.getCreatorEarnings(
          creator.id,
          periodStart,
          periodEnd
        );
        if (earnings && earnings.netPayout >= minPayout) {
          eligible.push({ creator, earnings });
        }
      }
      return eligible;
    },
  };
}
