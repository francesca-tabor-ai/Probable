import type { PaymentGateway, TransactionRequest, TransactionResult } from "../gateway-types.js";

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
}

export function createPayPalGatewayAdapter(_config: PayPalConfig): PaymentGateway {
  return {
    name: "paypal",

    async charge(request: TransactionRequest): Promise<TransactionResult> {
      try {
        // Placeholder: PayPal Orders API would be used in production
        // For now, return failure with a message indicating PayPal is not fully implemented
        return {
          success: false,
          gateway: "paypal",
          errorCode: "not_implemented",
          errorMessage:
            "PayPal adapter is a placeholder. Configure PayPal Orders API for production.",
        };
      } catch (err: unknown) {
        return {
          success: false,
          gateway: "paypal",
          errorCode: "unknown",
          errorMessage: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}
