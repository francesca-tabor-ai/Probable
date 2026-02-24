import type { Db } from "../../db/index.js";
import { creators, payoutRecords } from "../../db/schema.js";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { createPayoutService } from "../../services/payout.js";
import { logDecision } from "../../observability/decision-log.js";

export type PayoutSchedule = "weekly" | "bi-weekly" | "monthly";

export interface CPRAgentInput {
  periodStart: Date;
  periodEnd: Date;
  creatorIds?: string[];
}

export interface CPRAgentOutput {
  payoutsProcessed: number;
  totalAmount: number;
  discrepancies: { creatorId: string; reason: string }[];
  reports: {
    creatorId: string;
    gross: number;
    fees: number;
    net: number;
    status: string;
  }[];
}

export async function processCreatorPayouts(
  db: Db,
  input: CPRAgentInput
): Promise<CPRAgentOutput> {
  const payoutService = createPayoutService(db);
  const discrepancies: { creatorId: string; reason: string }[] = [];
  const reports: CPRAgentOutput["reports"] = [];

  const creatorsList = input.creatorIds
    ? await db
        .select()
        .from(creators)
        .where(inArray(creators.id, input.creatorIds))
    : await db.select().from(creators);

  let totalPayout = 0;
  let processed = 0;

  for (const creator of creatorsList) {
    const earnings = await payoutService.getCreatorEarnings(
      creator.id,
      input.periodStart,
      input.periodEnd
    );

    if (!earnings) continue;

    if (earnings.netPayout < parseFloat(creator.minPayoutAmount)) {
      continue;
    }

    const [existing] = await db
      .select()
      .from(payoutRecords)
      .where(
        and(
          eq(payoutRecords.creatorId, creator.id),
          gte(payoutRecords.periodStart, input.periodStart),
          lte(payoutRecords.periodEnd, input.periodEnd)
        )
      )
      .limit(1);

    if (existing) {
      discrepancies.push({
        creatorId: creator.id,
        reason: "Payout already exists for this period",
      });
      continue;
    }

    const record = await payoutService.createPayoutRecord({
      creatorId: creator.id,
      amount: String(earnings.netPayout),
      grossEarnings: String(earnings.grossEarnings),
      platformFee: String(earnings.platformFee),
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      status: "pending",
    });

    processed++;
    totalPayout += earnings.netPayout;

    reports.push({
      creatorId: creator.id,
      gross: earnings.grossEarnings,
      fees: earnings.platformFee,
      net: earnings.netPayout,
      status: record?.status ?? "pending",
    });

    await logDecision({
      agent: "CPR",
      entityId: creator.id,
      entityType: "creator_payout",
      trigger: "payout_calculation",
      payload: {
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      },
      decision: {
        gross: earnings.grossEarnings,
        platformFee: earnings.platformFee,
        net: earnings.netPayout,
        payoutRecordId: record?.id,
      },
      explanation: `Creator payout: gross ${earnings.grossEarnings.toFixed(2)} - platform fee ${earnings.platformFee.toFixed(2)} (${creator.platformFeePercent}%) = net ${earnings.netPayout.toFixed(2)}`,
    });
  }

  return {
    payoutsProcessed: processed,
    totalAmount: totalPayout,
    discrepancies,
    reports,
  };
}
