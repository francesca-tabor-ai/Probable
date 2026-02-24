import type { Db } from "../db/index.js";
import { subscriptions, transactions, payoutRecords } from "../db/schema.js";
import { eq, and, gte, sql, isNotNull } from "drizzle-orm";

export async function getSLMMetrics(db: Db, since?: Date) {
  const from = since ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [churnResult] = await db
    .select({
      canceled: sql<number>`count(*) filter (where status = 'canceled')`,
      total: sql<number>`count(*)`,
    })
    .from(subscriptions)
    .where(gte(subscriptions.updatedAt, from));

  const [renewalResult] = await db
    .select({
      succeeded: sql<number>`count(*) filter (where status = 'succeeded')`,
      failed: sql<number>`count(*) filter (where status = 'failed')`,
      total: sql<number>`count(*)`,
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.createdAt, from),
        isNotNull(transactions.subscriptionId)
      )
    );

  const churnRate =
    (churnResult?.canceled ?? 0) / Math.max(1, churnResult?.total ?? 1);
  const renewalRate =
    (renewalResult?.succeeded ?? 0) /
    Math.max(1, (renewalResult?.succeeded ?? 0) + (renewalResult?.failed ?? 1));

  return {
    churnRate,
    renewalRate,
    totalSubscriptions: churnResult?.total ?? 0,
    canceledCount: churnResult?.canceled ?? 0,
  };
}

export async function getPGOMetrics(db: Db, since?: Date) {
  const from = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      gateway: transactions.gateway,
      succeeded: sql<number>`count(*) filter (where status = 'succeeded')`,
      total: sql<number>`count(*)`,
    })
    .from(transactions)
    .where(gte(transactions.createdAt, from))
    .groupBy(transactions.gateway);

  return result.map((r) => ({
    gateway: r.gateway,
    successRate: (r.succeeded ?? 0) / Math.max(1, r.total ?? 1),
    totalTransactions: r.total ?? 0,
  }));
}

export async function getCPRMetrics(db: Db, since?: Date) {
  const from = since ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [result] = await db
    .select({
      totalPayouts: sql<number>`count(*)`,
      completed: sql<number>`count(*) filter (where status = 'completed')`,
      failed: sql<number>`count(*) filter (where status = 'failed')`,
      totalAmount: sql<string>`coalesce(sum(amount), 0)`,
    })
    .from(payoutRecords)
    .where(gte(payoutRecords.createdAt, from));

  const total = result?.totalPayouts ?? 0;
  const successRate =
    total > 0 ? (result?.completed ?? 0) / total : 0;

  return {
    totalPayouts: total,
    successRate,
    totalAmount: result?.totalAmount ?? "0",
    failedCount: result?.failed ?? 0,
  };
}

export async function getFDRMetrics(db: Db, since?: Date) {
  const from = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [result] = await db
    .select({
      total: sql<number>`count(*)`,
      disputed: sql<number>`count(*) filter (where status = 'disputed')`,
      failed: sql<number>`count(*) filter (where status = 'failed')`,
    })
    .from(transactions)
    .where(gte(transactions.createdAt, from));

  const total = result?.total ?? 0;
  return {
    totalTransactions: total,
    disputedCount: result?.disputed ?? 0,
    failedCount: result?.failed ?? 0,
    disputeRate: total > 0 ? (result?.disputed ?? 0) / total : 0,
  };
}
