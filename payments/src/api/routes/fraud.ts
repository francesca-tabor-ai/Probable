import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { assessFraudRisk } from "../../agents/fraud-detection/index.js";
import type { Db } from "../../db/index.js";

const assessSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("usd"),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  paymentMethodId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function registerFraudRoutes(
  app: FastifyInstance,
  deps: { db: Db }
) {
  app.post("/fraud/assess", async (request, reply) => {
    const parsed = assessSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }

    const result = await assessFraudRisk(deps.db, parsed.data);

    if (result.action === "block") {
      return reply.status(403).send({
        error: "Transaction blocked",
        riskScore: result.riskScore,
        action: result.action,
        rulesTriggered: result.rulesTriggered,
      });
    }

    return {
      riskScore: result.riskScore,
      action: result.action,
      rulesTriggered: result.rulesTriggered,
      evidence: result.evidence,
    };
  });
}
