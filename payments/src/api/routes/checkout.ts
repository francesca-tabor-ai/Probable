import type { FastifyInstance } from "fastify";
import { z } from "zod";

const createCheckoutSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
  trialDays: z.number().int().min(0).max(90).optional(),
});

export async function registerCheckoutRoutes(
  app: FastifyInstance,
  deps: { stripe: import("stripe").Stripe; db: import("../../db/index.js").Db }
) {
  const { createCheckoutSession } = await import(
    "../../integrations/stripe/checkout.js"
  );

  app.post("/checkout/session", async (request, reply) => {
    const parsed = createCheckoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }

    try {
      const { sessionId, url } = await createCheckoutSession(
        deps.stripe,
        deps.db,
        parsed.data
      );
      return { sessionId, url };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      return reply.status(400).send({ error: message });
    }
  });
}
