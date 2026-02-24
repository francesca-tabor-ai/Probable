import type { Db } from "../../db/index.js";
import {
  createFraudService,
  type FraudCheckInput,
  type FraudContext,
} from "../../services/fraud.js";
import { logDecision } from "../../observability/decision-log.js";

export type FraudAction = "approve" | "review" | "block";

export interface FDRAgentOutput {
  riskScore: number;
  action: FraudAction;
  rulesTriggered: { rule: string; score: number }[];
  evidence: string[];
}

const THRESHOLD_APPROVE = 30;
const THRESHOLD_BLOCK = 70;

function velocityRule(_input: FraudCheckInput, context: FraudContext): number {
  if (context.recentTransactionCount > 5) return 25;
  if (context.recentTransactionCount > 3) return 15;
  return 0;
}

function failedAttemptsRule(
  _input: FraudCheckInput,
  context: FraudContext
): number {
  if (context.failedAttemptCount >= 3) return 30;
  if (context.failedAttemptCount >= 1) return 10;
  return 0;
}

function amountRule(input: FraudCheckInput, context: FraudContext): number {
  const highThreshold = 500;
  if (input.amount > highThreshold) return 20;
  if (
    context.lastTransactionAmount &&
    input.amount > context.lastTransactionAmount * 2
  ) {
    return 15;
  }
  return 0;
}

function ipChangeRule(input: FraudCheckInput, context: FraudContext): number {
  if (!input.ipAddress || !context.lastTransactionIp) return 0;
  if (input.ipAddress !== context.lastTransactionIp) return 15;
  return 0;
}

const RULES: { name: string; check: (i: FraudCheckInput, c: FraudContext) => number }[] = [
  { name: "velocity", check: velocityRule },
  { name: "failed_attempts", check: failedAttemptsRule },
  { name: "amount_threshold", check: amountRule },
  { name: "ip_change", check: ipChangeRule },
];

export async function assessFraudRisk(
  db: Db,
  input: FraudCheckInput
): Promise<FDRAgentOutput> {
  const fraudService = createFraudService(db);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const context = await fraudService.getContext(input.userId, since);

  const rulesTriggered: { rule: string; score: number }[] = [];
  const evidence: string[] = [];

  let totalScore = 0;
  for (const rule of RULES) {
    const score = rule.check(input, context);
    if (score > 0) {
      rulesTriggered.push({ rule: rule.name, score });
      totalScore += score;
      evidence.push(`${rule.name}: +${score} points`);
    }
  }

  const riskScore = Math.min(100, totalScore);

  let action: FraudAction;
  if (riskScore < THRESHOLD_APPROVE) {
    action = "approve";
  } else if (riskScore >= THRESHOLD_BLOCK) {
    action = "block";
  } else {
    action = "review";
  }

  await logDecision({
    agent: "FDR",
    entityId: input.userId,
    entityType: "transaction",
    trigger: "fraud_assessment",
    payload: {
      amount: input.amount,
      currency: input.currency,
      ipAddress: input.ipAddress ? "***" : undefined,
    },
    decision: {
      riskScore,
      action,
      rulesTriggered,
    },
    explanation:
      action === "block"
        ? `Transaction blocked: risk score ${riskScore} (threshold ${THRESHOLD_BLOCK}). Rules: ${evidence.join("; ")}`
        : action === "review"
          ? `Transaction flagged for review: risk score ${riskScore}. Rules: ${evidence.join("; ")}`
          : `Transaction approved: risk score ${riskScore} below threshold.`,
  });

  return {
    riskScore,
    action,
    rulesTriggered,
    evidence,
  };
}
