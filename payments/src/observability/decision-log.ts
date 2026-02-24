import type { Db } from "../db/index.js";
import { agentDecisionLog } from "../db/schema.js";
import { eq, and, gte, desc } from "drizzle-orm";

export type Agent = "SLM" | "PGO" | "CPR" | "FDR";

export interface DecisionLogEntry {
  id: string;
  agent: Agent;
  entityId: string;
  entityType: string;
  trigger: string;
  payload: Record<string, unknown>;
  decision: Record<string, unknown>;
  explanation: string;
  timestamp: Date;
}

let db: Db | null = null;

export function initDecisionLog(database: Db) {
  db = database;
}

export async function logDecision(
  entry: Omit<DecisionLogEntry, "id" | "timestamp">
): Promise<void> {
  const full: Omit<DecisionLogEntry, "id"> = {
    ...entry,
    timestamp: new Date(),
  };
  if (db) {
    await db.insert(agentDecisionLog).values({
      agent: full.agent,
      entityId: full.entityId,
      entityType: full.entityType,
      trigger: full.trigger,
      payload: full.payload,
      decision: full.decision,
      explanation: full.explanation,
      timestamp: full.timestamp,
    });
  }
}

export async function getDecisions(filters?: {
  agent?: Agent;
  entityId?: string;
  since?: Date;
}): Promise<DecisionLogEntry[]> {
  if (!db) return [];

  let query = db.select().from(agentDecisionLog).$dynamic();

  const conditions = [];
  if (filters?.agent) {
    conditions.push(eq(agentDecisionLog.agent, filters.agent));
  }
  if (filters?.entityId) {
    conditions.push(eq(agentDecisionLog.entityId, filters.entityId));
  }
  if (filters?.since) {
    conditions.push(gte(agentDecisionLog.timestamp, filters.since));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const rows = await query.orderBy(desc(agentDecisionLog.timestamp));
  return rows.map((r) => ({
    id: r.id,
    agent: r.agent as Agent,
    entityId: r.entityId,
    entityType: r.entityType,
    trigger: r.trigger,
    payload: (r.payload as Record<string, unknown>) ?? {},
    decision: (r.decision as Record<string, unknown>) ?? {},
    explanation: r.explanation,
    timestamp: r.timestamp,
  }));
}
