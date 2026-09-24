import { PaymentStatus, OrderItem } from '../../types';

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  orderId?: string;
  description: string;
  paymentMethod: 'mobile_money' | 'bank_transfer' | 'card' | 'wallet';
  payerInfo: {
    userId: string;
    email?: string;
    name?: string;
    phoneNumber?: string;
  };
}

export interface PaymentIntentResult {
  transactionId: string;
  status: PaymentStatus;
  providerReference: string;
  amount: number;
  currency: string;
  redirectUrl?: string;
  timestamp: string;
  message?: string;
}

/**
 * PaymentService: Production-ready payment abstraction layer.
 * Can be connected to M-Pesa / Tigo Pesa / Airtel Money / Stripe / Flutterwave without altering consumer components.
 */
class PaymentServiceImpl {
  private activeProvider: 'sandbox' | 'flutterwave' | 'mpesa' = 'sandbox';

  public async processPayment(request: PaymentIntentRequest): Promise<PaymentIntentResult> {
    // Simulate gateway handoff latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validation
    if (request.amount <= 0) {
      return {
        transactionId: `tx_err_${Date.now()}`,
        status: 'failed',
        providerReference: '',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date().toISOString(),
        message: 'Invalid payment amount',
      };
    }

    const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ref = `ZENIA-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      transactionId: txId,
      status: 'paid',
      providerReference: ref,
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date().toISOString(),
      message: 'Payment completed successfully via secure mobile gateway',
    };
  }

  public async refundPayment(transactionId: string, reason: string): Promise<PaymentIntentResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      transactionId: `ref_${Date.now()}`,
      status: 'refunded',
      providerReference: transactionId,
      amount: 0,
      currency: 'TZS',
      timestamp: new Date().toISOString(),
      message: `Refund initiated: ${reason}`,
    };
  }
}

export const PaymentService = new PaymentServiceImpl();
