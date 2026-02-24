import type Stripe from "stripe";
import type { Db } from "../../db/index.js";
import { users, plans } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export interface CreateCheckoutSessionParams {
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  trialDays?: number;
}

export async function createCheckoutSession(
  stripe: Stripe,
  db: Db,
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url: string }> {
  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.id, params.planId))
    .limit(1);

  if (!plan) {
    throw new Error(`Plan not found: ${params.planId}`);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, params.userId))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${params.userId}`);
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail ?? user.email,
    line_items: [
      {
        price: plan.stripePriceId ?? undefined,
        quantity: 1,
        price_data: plan.stripePriceId
          ? undefined
          : {
              currency: (plan.currency as string) ?? "usd",
              unit_amount: Math.round(parseFloat(plan.price) * 100),
              recurring: {
                interval: (plan.interval as "month" | "year") ?? "month",
              },
              product_data: {
                name: plan.name,
              },
            },
      },
    ],
    subscription_data: {
      metadata: {
        userId: params.userId,
        planId: params.planId,
      },
      trial_period_days: params.trialDays,
    },
    metadata: {
      userId: params.userId,
      planId: params.planId,
    },
  };

  if (user.stripeCustomerId) {
    sessionParams.customer = user.stripeCustomerId;
    delete sessionParams.customer_email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}
