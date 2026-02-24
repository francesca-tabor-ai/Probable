import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import type { Db } from "../../db/index.js";
import { subscriptions, transactions, plans, users } from "../../db/schema.js";
import { getDecisions } from "../../observability/decision-log.js";
import {
  getSLMMetrics,
  getPGOMetrics,
  getCPRMetrics,
  getFDRMetrics,
} from "../../observability/metrics.js";
import { createSubscriptionLifecycleAgent } from "../../agents/subscription-lifecycle/index.js";

const listSubscriptionsSchema = z.object({
  userId: z.string().uuid().optional(),
  status: z.enum(["trial", "active", "past_due", "canceled", "paused"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function registerAdminRoutes(
  app: FastifyInstance,
  deps: { db: Db; stripe: import("stripe").Stripe }
) {
  const { db, stripe } = deps;

  app.get("/admin/subscriptions", async (request, reply) => {
    const parsed = listSubscriptionsSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }

    const conditions = [];
    if (parsed.data.userId) {
      conditions.push(eq(subscriptions.userId, parsed.data.userId));
    }
    if (parsed.data.status) {
      conditions.push(eq(subscriptions.status, parsed.data.status));
    }

    const items = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(parsed.data.limit)
      .offset(parsed.data.offset);

    return { subscriptions: items };
  });

  app.get("/admin/plans", async () => {
    const items = await db.select().from(plans);
    return { plans: items };
  });

  app.post("/admin/plans", async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1).max(100),
      price: z.number().positive(),
      currency: z.string().length(3).default("usd"),
      interval: z.enum(["monthly", "annual"]),
      stripePriceId: z.string().optional(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }
    const [created] = await db
      .insert(plans)
      .values({
        ...parsed.data,
        price: String(parsed.data.price),
      })
      .returning();
    return { plan: created };
  });

  app.get("/admin/metrics/slm", async (request, reply) => {
    const schema = z.object({
      since: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(request.query);
    const since = parsed.data?.since ? new Date(parsed.data.since) : undefined;
    const metrics = await getSLMMetrics(db, since);
    return { metrics };
  });

  app.get("/admin/metrics/pgo", async (request, reply) => {
    const schema = z.object({
      since: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(request.query);
    const since = parsed.data?.since ? new Date(parsed.data.since) : undefined;
    const metrics = await getPGOMetrics(db, since);
    return { metrics };
  });

  app.get("/admin/metrics/cpr", async (request, reply) => {
    const schema = z.object({
      since: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(request.query);
    const since = parsed.data?.since ? new Date(parsed.data.since) : undefined;
    const metrics = await getCPRMetrics(db, since);
    return { metrics };
  });

  app.get("/admin/metrics/fdr", async (request, reply) => {
    const schema = z.object({
      since: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(request.query);
    const since = parsed.data?.since ? new Date(parsed.data.since) : undefined;
    const metrics = await getFDRMetrics(db, since);
    return { metrics };
  });

  app.get("/admin/decisions", async (request, reply) => {
    const schema = z.object({
      agent: z.enum(["SLM", "PGO", "CPR", "FDR"]).optional(),
      entityId: z.string().optional(),
      since: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }
    const decisions = await getDecisions({
      agent: parsed.data.agent,
      entityId: parsed.data.entityId,
      since: parsed.data.since ? new Date(parsed.data.since) : undefined,
    });
    return { decisions };
  });

  app.post("/admin/subscriptions/:subscriptionId/plan-change", async (request, reply) => {
    const { subscriptionId } = request.params as { subscriptionId: string };
    const schema = z.object({
      newPlanId: z.string().uuid(),
      changeType: z.enum(["upgrade", "downgrade"]),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }
    const slmAgent = createSubscriptionLifecycleAgent(db, stripe);
    const result = await slmAgent.processPlanChange({
      subscriptionId,
      newPlanId: parsed.data.newPlanId,
      changeType: parsed.data.changeType,
    });
    return { success: result.subscriptionUpdated, prorationApplied: result.prorationApplied };
  });

  app.post("/admin/users", async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }
    const [created] = await db
      .insert(users)
      .values({ email: parsed.data.email })
      .returning();
    return { user: created };
  });

  app.get("/admin/transactions", async (request, reply) => {
    const schema = z.object({
      userId: z.string().uuid().optional(),
      limit: z.coerce.number().min(1).max(100).default(20),
      offset: z.coerce.number().min(0).default(0),
    });
    const parsed = schema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }

    const items = await db
      .select()
      .from(transactions)
      .where(parsed.data.userId ? eq(transactions.userId, parsed.data.userId) : undefined)
      .orderBy(desc(transactions.createdAt))
      .limit(parsed.data.limit)
      .offset(parsed.data.offset);

    return { transactions: items };
  });
}
