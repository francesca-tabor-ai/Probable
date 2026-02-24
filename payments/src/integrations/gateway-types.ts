export interface TransactionRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  gateway: string;
  gatewayTxnId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentGateway {
  name: string;
  charge(request: TransactionRequest): Promise<TransactionResult>;
}
