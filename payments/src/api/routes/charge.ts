import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createStripeGatewayAdapter } from "../../integrations/stripe/adapter.js";
import { createPayPalGatewayAdapter } from "../../integrations/paypal/adapter.js";
import { processTransaction } from "../../agents/payment-gateway-orchestration/index.js";
import type { Db } from "../../db/index.js";
import type Stripe from "stripe";

const chargeSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("usd"),
  paymentMethodId: z.string().min(1),
  customerId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function registerChargeRoutes(
  app: FastifyInstance,
  deps: {
    stripe: Stripe;
    db: Db;
    paypalClientId?: string;
    paypalClientSecret?: string;
  }
) {
  const gateways = [
    createStripeGatewayAdapter(deps.stripe),
  ];
  if (deps.paypalClientId && deps.paypalClientSecret) {
    gateways.push(
      createPayPalGatewayAdapter({
        clientId: deps.paypalClientId,
        clientSecret: deps.paypalClientSecret,
      })
    );
  }

  app.post("/charge", async (request, reply) => {
    const parsed = chargeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }

    const result = await processTransaction({
      request: parsed.data,
      gateways,
    });

    if (!result.result.success) {
      return reply.status(402).send({
        error: "Payment failed",
        gateway: result.chosenGateway,
        errorCode: result.result.errorCode,
        errorMessage: result.result.errorMessage,
        fallbackAttempts: result.fallbackAttempts,
      });
    }

    return {
      success: true,
      transactionId: result.result.transactionId,
      gateway: result.chosenGateway,
      selectionReason: result.selectionReason,
    };
  });
}
