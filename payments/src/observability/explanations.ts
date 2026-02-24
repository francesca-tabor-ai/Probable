import type { Agent } from "./decision-log.js";

/**
 * Generate human-readable explanations for agent decisions.
 * Used by the Observability Module to provide context for audits and debugging.
 */
export function formatExplanation(
  agent: Agent,
  decision: Record<string, unknown>,
  trigger: string
): string {
  switch (agent) {
    case "SLM":
      return formatSLMExplanation(decision, trigger);
    case "PGO":
      return formatPGOExplanation(decision, trigger);
    case "CPR":
      return formatCPRExplanation(decision, trigger);
    case "FDR":
      return formatFDRExplanation(decision, trigger);
    default:
      return `Agent ${agent}: ${trigger} - ${JSON.stringify(decision)}`;
  }
}

function formatSLMExplanation(
  decision: Record<string, unknown>,
  trigger: string
): string {
  const fromState = decision.fromState as string | undefined;
  const toState = decision.toState as string | undefined;
  if (fromState && toState) {
    return `Subscription moved from ${fromState} to ${toState} due to ${trigger}.`;
  }
  const proration = decision.prorationDetails as Record<string, unknown> | undefined;
  if (proration) {
    return `Plan change applied: ${JSON.stringify(proration)}`;
  }
  return `SLM: ${trigger}`;
}

function formatPGOExplanation(
  decision: Record<string, unknown>,
  _trigger: string
): string {
  const gateway = decision.chosenGateway as string | undefined;
  const reason = decision.selectionReason as string | undefined;
  const success = decision.success as boolean | undefined;
  if (success) {
    return `Transaction routed to ${gateway ?? "gateway"}. ${reason ?? ""}`;
  }
  const fallbacks = decision.fallbackAttempts as Array<{ gateway: string }> | undefined;
  return `Transaction failed. Fallbacks attempted: ${fallbacks?.map((f) => f.gateway).join(", ") ?? "none"}`;
}

function formatCPRExplanation(
  decision: Record<string, unknown>,
  _trigger: string
): string {
  const gross = decision.gross as number | undefined;
  const platformFee = decision.platformFee as number | undefined;
  const net = decision.net as number | undefined;
  if (gross != null && platformFee != null && net != null) {
    return `Payout: gross ${gross.toFixed(2)} - fee ${platformFee.toFixed(2)} = net ${net.toFixed(2)}`;
  }
  return `CPR: ${JSON.stringify(decision)}`;
}

function formatFDRExplanation(
  decision: Record<string, unknown>,
  _trigger: string
): string {
  const riskScore = decision.riskScore as number | undefined;
  const action = decision.action as string | undefined;
  const rules = decision.rulesTriggered as Array<{ rule: string; score: number }> | undefined;
  const ruleSummary = rules?.map((r) => `${r.rule}(+${r.score})`).join(", ");
  return `Fraud assessment: score ${riskScore ?? "?"}, action ${action ?? "?"}. Rules: ${ruleSummary ?? "none"}`;
}
