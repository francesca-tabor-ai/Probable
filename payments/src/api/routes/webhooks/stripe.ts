import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type Stripe from "stripe";
import type { Db } from "../../../db/index.js";
import {
  users,
  subscriptions,
  transactions,
  plans,
  processedEvents,
} from "../../../db/schema.js";
import { eq, and } from "drizzle-orm";

export async function registerStripeWebhookRoutes(
  app: FastifyInstance,
  deps: {
    stripe: Stripe;
    db: Db;
    webhookSecret: string;
  }
) {
  app.post(
    "/webhooks/stripe",
    {
      config: {
        rawBody: true,
      },
    },
    async (request: FastifyRequest<{ Body: Buffer | string }>, reply: FastifyReply) => {
      const sig = request.headers["stripe-signature"];
      if (!sig || typeof sig !== "string") {
        return reply.status(400).send("Missing stripe-signature header");
      }

      const rawBody =
        typeof request.body === "string"
          ? Buffer.from(request.body, "utf-8")
          : (request.body as Buffer);

      let event: Stripe.Event;
      try {
        event = deps.stripe.webhooks.constructEvent(
          rawBody,
          sig,
          deps.webhookSecret
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid signature";
        return reply.status(400).send(`Webhook Error: ${message}`);
      }

      const [existing] = await deps.db
        .select()
        .from(processedEvents)
        .where(
          and(
            eq(processedEvents.gateway, "stripe"),
            eq(processedEvents.eventId, event.id)
          )
        )
        .limit(1);

      if (existing) {
        return reply.status(200).send({ received: true });
      }

      await deps.db.insert(processedEvents).values({
        gateway: "stripe",
        eventId: event.id,
      });

      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(deps.stripe, deps.db, event.data.object as Stripe.Checkout.Session);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await handleSubscriptionEvent(deps.db, event.data.object as Stripe.Subscription);
          break;
        case "invoice.paid":
          await handleInvoicePaid(deps.db, event.data.object as Stripe.Invoice);
          break;
        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(deps.db, event.data.object as Stripe.Invoice);
          break;
        default:
          break;
      }

      return reply.status(200).send({ received: true });
    }
  );
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  db: Db,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId as string | undefined;
  const planId = session.metadata?.planId as string | undefined;

  if (!userId || !planId || !session.subscription) return;

  const sub = await stripe.subscriptions.retrieve(session.subscription as string);
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!plan) return;

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (customerId) {
    await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  const periodStart = new Date((sub.current_period_start as number) * 1000);
  const periodEnd = new Date((sub.current_period_end as number) * 1000);
  const status = sub.status === "trialing" ? "trial" : sub.status === "active" ? "active" : "active";

  await db.insert(subscriptions).values({
    userId,
    planId,
    status,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    trialEnd: sub.trial_end ? new Date((sub.trial_end as number) * 1000) : null,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: customerId ?? null,
  });
}

async function handleSubscriptionEvent(db: Db, sub: Stripe.Subscription) {
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  const periodStart = new Date((sub.current_period_start as number) * 1000);
  const periodEnd = new Date((sub.current_period_end as number) * 1000);
  const status = mapStripeStatusToInternal(sub.status);

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end ? periodEnd : null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
  }
}

function mapStripeStatusToInternal(
  stripeStatus: string
): "trial" | "active" | "past_due" | "canceled" | "paused" {
  switch (stripeStatus) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "paused":
      return "paused";
    default:
      return "active";
  }
}

async function handleInvoicePaid(db: Db, invoice: Stripe.Invoice) {
  const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subId))
    .limit(1);

  if (!sub) return;

  const amount = invoice.amount_paid ?? 0;
  const currency = (invoice.currency ?? "usd").toLowerCase();

  await db.insert(transactions).values({
    userId: sub.userId,
    amount: String(amount / 100),
    currency,
    status: "succeeded",
    gateway: "stripe",
    gatewayTxnId: invoice.payment_intent as string ?? invoice.id,
    gatewayEventId: invoice.id,
    subscriptionId: sub.id,
  });
}

async function handleInvoicePaymentFailed(db: Db, invoice: Stripe.Invoice) {
  const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subId))
    .limit(1);

  if (!sub) return;

  const newCount = String(parseInt(sub.dunningRetryCount, 10) + 1);

  await db
    .update(subscriptions)
    .set({
      status: "past_due",
      dunningRetryCount: newCount,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subId));

  const amount = invoice.amount_due ?? 0;
  const currency = (invoice.currency ?? "usd").toLowerCase();

  await db.insert(transactions).values({
    userId: sub.userId,
    amount: String(amount / 100),
    currency,
    status: "failed",
    gateway: "stripe",
    gatewayTxnId: invoice.payment_intent as string ?? invoice.id,
    gatewayEventId: invoice.id,
    subscriptionId: sub.id,
  });
}
