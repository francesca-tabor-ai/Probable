CREATE TABLE IF NOT EXISTS "payment_agent_decision_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent" varchar(10) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"trigger" varchar(100) NOT NULL,
	"payload" jsonb,
	"decision" jsonb,
	"explanation" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "decision_log_agent_idx" ON "payment_agent_decision_log" USING btree ("agent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "decision_log_entity_idx" ON "payment_agent_decision_log" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "decision_log_timestamp_idx" ON "payment_agent_decision_log" USING btree ("timestamp");