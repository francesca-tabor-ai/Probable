import type Stripe from "stripe";

/**
 * Stripe Connect integration for creator payouts.
 * Used by the Creator Payout & Reconciliation Agent.
 *
 * In production, use Stripe Connect Express or Standard accounts
 * to transfer funds to connected creator accounts.
 */
export interface StripeConnectConfig {
  stripe: Stripe;
}

export function createStripeConnectClient(config: StripeConnectConfig) {
  const { stripe } = config;

  return {
    /**
     * Create a transfer to a connected account.
     * Requires the creator to have stripe_connect_account_id set.
     */
    async createTransfer(params: {
      amount: number;
      currency: string;
      destinationAccountId: string;
      transferGroup?: string;
    }) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(params.amount * 100),
          currency: params.currency.toLowerCase(),
          destination: params.destinationAccountId,
          transfer_group: params.transferGroup,
        });
        return {
          success: true,
          transferId: transfer.id,
        };
      } catch (err: unknown) {
        const stripeErr = err as { code?: string; message?: string };
        return {
          success: false,
          errorCode: stripeErr.code ?? "unknown",
          errorMessage: stripeErr.message ?? String(err),
        };
      }
    },
  };
}
