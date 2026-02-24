import type Stripe from "stripe";
import type { PaymentGateway, TransactionRequest, TransactionResult } from "../gateway-types.js";

export function createStripeGatewayAdapter(stripe: Stripe): PaymentGateway {
  return {
    name: "stripe",

    async charge(request: TransactionRequest): Promise<TransactionResult> {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(request.amount * 100),
          currency: request.currency.toLowerCase(),
          payment_method: request.paymentMethodId,
          customer: request.customerId,
          confirm: true,
          automatic_payment_methods: { enabled: true, allow_redirects: "never" },
          metadata: request.metadata ?? {},
        });

        const status = paymentIntent.status;
        const success =
          status === "succeeded" || status === "requires_capture";

        return {
          success,
          transactionId: paymentIntent.id,
          gateway: "stripe",
          gatewayTxnId: paymentIntent.id,
        };
      } catch (err: unknown) {
        const stripeError = err as { code?: string; message?: string };
        return {
          success: false,
          gateway: "stripe",
          errorCode: stripeError.code ?? "unknown",
          errorMessage: stripeError.message ?? String(err),
        };
      }
    },
  };
}
