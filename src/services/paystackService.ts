
interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

interface PaymentData {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  currency: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

class PaystackService {
  private config: PaystackConfig;

  constructor() {
    this.config = {
      publicKey: import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY, // This will be replaced with actual env variable
      secretKey: import.meta.env.VITE_PAYSTACK_LIVE_SECRET_KEY, // This will be replaced with actual env variable
      baseUrl: 'https://api.paystack.co'
    };
  }

  // Convert amount to kobo (Paystack uses kobo for NGN, cents for other currencies)
  private convertToSmallestUnit(amount: number, currency: string): number {
    // For GHS, multiply by 100 to get pesewas
    // For EUR, multiply by 100 to get cents
    return Math.round(amount * 100);
  }

  // Generate unique reference
  private generateReference(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize payment
  async initializePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const reference = paymentData.reference || this.generateReference();
      
      const payload = {
        email: paymentData.email,
        amount: this.convertToSmallestUnit(paymentData.amount, paymentData.currency),
        currency: paymentData.currency,
        reference,
        callback_url: paymentData.callback_url || `${window.location.origin}/payment/callback`,
        metadata: {
          ...paymentData.metadata,
          cancel_action: `${window.location.origin}/checkout`
        }
      };


      const response = await fetch(`${this.config.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment initialization failed');
      }

      return result;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment verification failed');
      }

      return result;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  // Get supported currencies
  getSupportedCurrencies(): string[] {
    return ['GHS', 'NGN', 'USD', 'EUR'];
  }

  // Check if currency is supported
  isCurrencySupported(currency: string): boolean {
    return this.getSupportedCurrencies().includes(currency);
  }
}

export const paystackService = new PaystackService();
export type { PaymentData, PaymentResponse };
