import type { Db } from "../db/index.js";
import { subscriptions, plans } from "../db/schema.js";
import { eq, and, gt, lte } from "drizzle-orm";
import type Stripe from "stripe";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "canceled"
  | "paused";

export interface SubscriptionStateTransition {
  subscriptionId: string;
  userId: string;
  fromState: SubscriptionStatus;
  toState: SubscriptionStatus;
  trigger: string;
  prorationDetails?: Record<string, unknown>;
}

export function createSubscriptionService(db: Db) {
  return {
    async getById(id: string) {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, id))
        .limit(1);
      return sub ?? null;
    },

    async getByStripeId(stripeSubscriptionId: string) {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
        .limit(1);
      return sub ?? null;
    },

    async updateStatus(
      id: string,
      status: SubscriptionStatus,
      metadata?: Record<string, unknown>
    ) {
      await db
        .update(subscriptions)
        .set({
          status,
          updatedAt: new Date(),
          ...(metadata && { metadata }),
        })
        .where(eq(subscriptions.id, id));
    },

    async getSubscriptionsDueForRenewal(beforeDate: Date) {
      return db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "active"),
            lte(subscriptions.currentPeriodEnd, beforeDate)
          )
        );
    },

    async getPastDueSubscriptions(dunningRetryCount: number) {
      return db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "past_due"),
            eq(subscriptions.dunningRetryCount, String(dunningRetryCount))
          )
        );
    },
  };
}

export type SubscriptionService = ReturnType<typeof createSubscriptionService>;
