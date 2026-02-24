import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  text,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trial",
  "active",
  "past_due",
  "canceled",
  "paused",
]);

export const planIntervalEnum = pgEnum("plan_interval", ["monthly", "annual"]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
  "disputed",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "initiated",
  "completed",
  "failed",
]);

// Tables
export const users = pgTable("payment_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creators = pgTable("payment_creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platformFeePercent: decimal("platform_fee_percent", { precision: 5, scale: 2 })
    .default("10")
    .notNull(),
  payoutSchedule: varchar("payout_schedule", { length: 20 }).default("weekly"),
  minPayoutAmount: decimal("min_payout_amount", { precision: 12, scale: 2 })
    .default("50")
    .notNull(),
  stripeConnectAccountId: varchar("stripe_connect_account_id", { length: 255 }),
  taxInfo: jsonb("tax_info").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const plans = pgTable("payment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  interval: planIntervalEnum("interval").notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable(
  "payment_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").notNull().default("trial"),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    trialEnd: timestamp("trial_end"),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    cancelAtPeriodEnd: timestamp("cancel_at_period_end"),
    dunningRetryCount: decimal("dunning_retry_count", { precision: 3, scale: 0 })
      .default("0")
      .notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_stripe_id_idx").on(table.stripeSubscriptionId),
  ]
);

export const transactions = pgTable(
  "payment_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: transactionStatusEnum("status").notNull().default("pending"),
    gateway: varchar("gateway", { length: 50 }).notNull(),
    gatewayTxnId: varchar("gateway_txn_id", { length: 255 }),
    gatewayEventId: varchar("gateway_event_id", { length: 255 }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("transactions_user_id_idx").on(table.userId),
    index("transactions_gateway_event_idx").on(table.gatewayEventId),
  ]
);

export const payoutRecords = pgTable(
  "payment_payout_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("usd").notNull(),
    status: payoutStatusEnum("status").notNull().default("pending"),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    grossEarnings: decimal("gross_earnings", { precision: 12, scale: 2 }).notNull(),
    platformFee: decimal("platform_fee", { precision: 12, scale: 2 }).notNull(),
    gatewayPayoutId: varchar("gateway_payout_id", { length: 255 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("payout_records_creator_id_idx").on(table.creatorId)]
);

// Content association: links transactions to creators (for creator earnings)
export const contentCreatorAssignments = pgTable(
  "payment_content_creator_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    contentType: varchar("content_type", { length: 50 }).notNull(),
    contentId: varchar("content_id", { length: 255 }).notNull(),
    sharePercent: decimal("share_percent", { precision: 5, scale: 2 })
      .default("100")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("content_creator_content_idx").on(table.contentType, table.contentId),
  ]
);

// Idempotency: prevent duplicate webhook processing
export const processedEvents = pgTable(
  "payment_processed_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gateway: varchar("gateway", { length: 50 }).notNull(),
    eventId: varchar("event_id", { length: 255 }).notNull(),
    processedAt: timestamp("processed_at").defaultNow().notNull(),
  },
  (table) => [index("processed_events_id_idx").on(table.gateway, table.eventId)]
);
