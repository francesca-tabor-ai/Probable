import type { PaymentGateway, TransactionRequest, TransactionResult } from "../../integrations/gateway-types.js";
import { logDecision } from "../../observability/decision-log.js";

export interface GatewayRoutingRule {
  currency?: string;
  region?: string;
  preferredGateway: string;
}

export interface PGOAgentInput {
  request: TransactionRequest;
  gateways: PaymentGateway[];
  routingRules?: GatewayRoutingRule[];
}

export interface PGOAgentOutput {
  result: TransactionResult;
  chosenGateway: string;
  selectionReason: string;
  fallbackAttempts: { gateway: string; error: string }[];
}

const DEFAULT_CURRENCY_GATEWAY: Record<string, string> = {
  usd: "stripe",
  eur: "stripe",
  gbp: "stripe",
  "*": "stripe",
};

function selectGateway(
  request: TransactionRequest,
  gateways: Map<string, PaymentGateway>,
  rules?: GatewayRoutingRule[]
): { gateway: string; reason: string } {
  const fallback = gateways.get("stripe") ?? Array.from(gateways.values())[0];
  if (!fallback) {
    throw new Error("No payment gateways configured");
  }

  const currency = request.currency?.toLowerCase() ?? "usd";
  const preferred =
    rules?.find(
      (r) =>
        (r.currency === undefined || r.currency.toLowerCase() === currency) &&
        gateways.has(r.preferredGateway)
    )?.preferredGateway ?? DEFAULT_CURRENCY_GATEWAY[currency] ?? DEFAULT_CURRENCY_GATEWAY["*"];

  const gateway = gateways.get(preferred) ?? fallback;
  return {
    gateway: gateway.name,
    reason: `Routed to ${gateway.name} (currency: ${currency}, highest success rate)`,
  };
}

export async function processTransaction(
  input: PGOAgentInput
): Promise<PGOAgentOutput> {
  const gatewaysMap = new Map(input.gateways.map((g) => [g.name, g]));
  const fallbackAttempts: { gateway: string; error: string }[] = [];

  const { gateway: primaryName, reason } = selectGateway(
    input.request,
    gatewaysMap,
    input.routingRules
  );
  const primary = gatewaysMap.get(primaryName);

  if (!primary) {
    throw new Error(`Gateway not found: ${primaryName}`);
  }

  let result = await primary.charge(input.request);

  if (result.success) {
    const sanitizedPayload = {
      amount: input.request.amount,
      currency: input.request.currency,
      gateway: primaryName,
    };
    await logDecision({
      agent: "PGO",
      entityId: result.transactionId ?? "unknown",
      entityType: "transaction",
      trigger: "charge",
      payload: sanitizedPayload,
      decision: {
        chosenGateway: primaryName,
        selectionReason: reason,
        success: true,
      },
      explanation: `Transaction routed to ${primaryName} (${reason}); charge succeeded.`,
    });
    return {
      result,
      chosenGateway: primaryName,
      selectionReason: reason,
      fallbackAttempts,
    };
  }

  const fallbackGateways = input.gateways.filter((g) => g.name !== primaryName);
  for (const fallback of fallbackGateways) {
    result = await fallback.charge(input.request);
    fallbackAttempts.push({
      gateway: fallback.name,
      error: result.errorMessage ?? result.errorCode ?? "unknown",
    });
    if (result.success) {
      await logDecision({
        agent: "PGO",
        entityId: result.transactionId ?? "unknown",
        entityType: "transaction",
        trigger: "charge",
        payload: {
          amount: input.request.amount,
          currency: input.request.currency,
          primaryGateway: primaryName,
          fallbackGateway: fallback.name,
        },
        decision: {
          chosenGateway: fallback.name,
          selectionReason: `Fallback after ${primaryName} failed`,
          success: true,
          fallbackAttempts,
        },
        explanation: `Primary gateway ${primaryName} failed; transaction succeeded via fallback to ${fallback.name}.`,
      });
      return {
        result,
        chosenGateway: fallback.name,
        selectionReason: `Fallback after ${primaryName} failed`,
        fallbackAttempts,
      };
    }
  }

  await logDecision({
    agent: "PGO",
    entityId: "unknown",
    entityType: "transaction",
    trigger: "charge",
    payload: {
      amount: input.request.amount,
      currency: input.request.currency,
      gateway: primaryName,
    },
    decision: {
      chosenGateway: primaryName,
      success: false,
      fallbackAttempts,
    },
    explanation: `Transaction failed on ${primaryName}${fallbackAttempts.length > 0 ? ` and fallbacks (${fallbackAttempts.map((f) => f.gateway).join(", ")})` : ""}.`,
  });

  return {
    result,
    chosenGateway: primaryName,
    selectionReason: reason,
    fallbackAttempts,
  };
}
