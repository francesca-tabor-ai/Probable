import type Stripe from "stripe";
import type { Db } from "../../db/index.js";
import {
  createSubscriptionService,
  type SubscriptionStateTransition,
} from "../../services/subscription.js";
import { logDecision } from "../../observability/decision-log.js";
import { getDunningRuleForRetryCount } from "../../config/dunning.js";
import { subscriptions } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export interface SubscriptionEvent {
  type: "payment_success" | "payment_failed" | "user_cancel" | "trial_end";
  subscriptionId?: string;
  stripeSubscriptionId?: string;
  userId?: string;
}

export interface PlanChangeRequest {
  subscriptionId: string;
  newPlanId: string;
  changeType: "upgrade" | "downgrade";
}

export interface SLMAgentOutput {
  subscriptionUpdated: boolean;
  stateTransition?: SubscriptionStateTransition;
  dunningScheduled?: boolean;
  dunningRetryCount?: number;
  prorationApplied?: Record<string, unknown>;
}

export function createSubscriptionLifecycleAgent(db: Db, stripe?: Stripe | null) {
  const subService = createSubscriptionService(db);

  return {
    async processSubscriptionEvent(event: SubscriptionEvent): Promise<SLMAgentOutput> {
      const sub = event.subscriptionId
        ? await subService.getById(event.subscriptionId)
        : event.stripeSubscriptionId
          ? await subService.getByStripeId(event.stripeSubscriptionId)
          : null;

      if (!sub) {
        return { subscriptionUpdated: false };
      }

      const fromState = sub.status as "trial" | "active" | "past_due" | "canceled" | "paused";
      let toState = fromState;
      let trigger: string = event.type;
      let prorationDetails: Record<string, unknown> | undefined;

      switch (event.type) {
        case "payment_success":
          toState = "active";
          break;
        case "payment_failed": {
          const retryCount = parseInt(sub.dunningRetryCount, 10) + 1;
          const rule = getDunningRuleForRetryCount(retryCount);
          if (rule?.action === "cancel") {
            toState = "canceled";
            trigger = "dunning_exhausted";
          } else {
            toState = "past_due";
          }
          break;
        }
        case "user_cancel":
          toState = "canceled";
          break;
        case "trial_end":
          toState = "active";
          break;
      }

      if (toState !== fromState) {
        const dunningCount =
          event.type === "payment_failed" && toState === "past_due"
            ? parseInt(sub.dunningRetryCount, 10) + 1
            : undefined;
        await db
          .update(subscriptions)
          .set({
            status: toState,
            updatedAt: new Date(),
            ...(dunningCount !== undefined && {
              dunningRetryCount: String(dunningCount),
            }),
          })
          .where(eq(subscriptions.id, sub.id));

        const transition: SubscriptionStateTransition = {
          subscriptionId: sub.id,
          userId: sub.userId,
          fromState,
          toState,
          trigger,
          prorationDetails,
        };

        await logDecision({
          agent: "SLM",
          entityId: sub.id,
          entityType: "subscription",
          trigger,
          payload: { event },
          decision: transition as unknown as Record<string, unknown>,
          explanation: buildExplanation(transition),
        });

        const nextDunningCount =
          event.type === "payment_failed" && toState === "past_due"
            ? parseInt(sub.dunningRetryCount, 10) + 1
            : undefined;
        const dunningRule =
          nextDunningCount !== undefined
            ? getDunningRuleForRetryCount(nextDunningCount)
            : null;

        return {
          subscriptionUpdated: true,
          stateTransition: transition,
          dunningScheduled: toState === "past_due" && dunningRule != null,
          dunningRetryCount: nextDunningCount,
        };
      }

      return { subscriptionUpdated: false };
    },

    async processPlanChange(request: PlanChangeRequest): Promise<SLMAgentOutput> {
      const sub = await subService.getById(request.subscriptionId);
      if (!sub || sub.status === "canceled") {
        return { subscriptionUpdated: false };
      }

      const prorationDetails = calculateProration(sub, request.changeType, request.newPlanId);

      await logDecision({
        agent: "SLM",
        entityId: sub.id,
        entityType: "subscription",
        trigger: "plan_change",
        payload: request as unknown as Record<string, unknown>,
        decision: { prorationDetails },
        explanation: `Plan ${request.changeType} applied. ${JSON.stringify(prorationDetails)}`,
      });

      return {
        subscriptionUpdated: true,
        prorationApplied: prorationDetails,
      };
    },
  };
}

function buildExplanation(transition: SubscriptionStateTransition): string {
  const { fromState, toState, trigger } = transition;
  if (trigger === "dunning_exhausted") {
    return `Subscription moved to canceled: dunning retries exhausted after payment failures.`;
  }
  if (trigger === "payment_failed") {
    return `Subscription moved to past_due due to invoice.payment_failed; dunning rule scheduled.`;
  }
  if (trigger === "payment_success") {
    return `Subscription moved to active due to successful renewal payment.`;
  }
  return `Subscription moved from ${fromState} to ${toState} due to ${trigger}.`;
}

function calculateProration(
  sub: { currentPeriodStart: Date; currentPeriodEnd: Date; planId: string },
  changeType: string,
  newPlanId: string
): Record<string, unknown> {
  const now = new Date();
  const periodMs =
    sub.currentPeriodEnd.getTime() - sub.currentPeriodStart.getTime();
  const elapsedMs = now.getTime() - sub.currentPeriodStart.getTime();
  const remainingDays = Math.max(
    0,
    (sub.currentPeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );

  return {
    changeType,
    newPlanId,
    remainingDays: Math.round(remainingDays),
    prorateCredit:
      changeType === "upgrade" ? "applied_immediately" : "at_period_end",
    effectiveAt: changeType === "upgrade" ? "immediate" : "period_end",
  };
}
