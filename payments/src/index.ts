import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyRawBody from "fastify-raw-body";
import { loadConfig } from "./config/index.js";
import { createDb } from "./db/index.js";
import { createStripeClient } from "./integrations/stripe/client.js";
import { createDunningQueue } from "./queues/dunning.js";
import { registerCheckoutRoutes } from "./api/routes/checkout.js";
import { registerChargeRoutes } from "./api/routes/charge.js";
import { registerStripeWebhookRoutes } from "./api/routes/webhooks/stripe.js";
import { registerAdminRoutes } from "./api/routes/admin.js";
import { registerPayoutRoutes } from "./api/routes/payouts.js";
import { registerFraudRoutes } from "./api/routes/fraud.js";

async function main() {
  const config = loadConfig();
  const db = createDb(config.DATABASE_URL);
  const { initDecisionLog } = await import("./observability/decision-log.js");
  initDecisionLog(db);
  const stripe = createStripeClient(config.STRIPE_SECRET_KEY);
  const dunningQueue = createDunningQueue(config.REDIS_URL);

  const app = Fastify({
    logger: true,
  });

  await app.register(cors, { origin: true });
  await app.register(fastifyRawBody, {
    field: "rawBody",
    encoding: false,
    runFirst: true,
  });

  app.get("/health", async () => ({ status: "ok" }));

  registerCheckoutRoutes(app, { stripe, db });
  registerChargeRoutes(app, {
    stripe,
    db,
    paypalClientId: config.PAYPAL_CLIENT_ID,
    paypalClientSecret: config.PAYPAL_CLIENT_SECRET,
  });
  registerAdminRoutes(app, { db, stripe });
  registerPayoutRoutes(app, { db });
  registerFraudRoutes(app, { db });
  registerStripeWebhookRoutes(app, {
    stripe,
    db,
    webhookSecret: config.STRIPE_WEBHOOK_SECRET ?? "whsec_placeholder",
    dunningQueue,
  });

  const port = config.PORT;
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Payments service listening on http://localhost:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
