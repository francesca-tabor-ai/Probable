import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { processCreatorPayouts } from "../../agents/creator-payout-reconciliation/index.js";
import type { Db } from "../../db/index.js";

const runPayoutsSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  creatorIds: z.array(z.string().uuid()).optional(),
});

export async function registerPayoutRoutes(
  app: FastifyInstance,
  deps: { db: Db }
) {
  app.post("/admin/payouts/run", async (request, reply) => {
    const parsed = runPayoutsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.format(),
      });
    }

    const result = await processCreatorPayouts(deps.db, {
      periodStart: new Date(parsed.data.periodStart),
      periodEnd: new Date(parsed.data.periodEnd),
      creatorIds: parsed.data.creatorIds,
    });

    return {
      payoutsProcessed: result.payoutsProcessed,
      totalAmount: result.totalAmount,
      discrepancies: result.discrepancies,
      reports: result.reports,
    };
  });
}
