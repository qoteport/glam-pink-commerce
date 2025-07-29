import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { paystackService, PaymentData } from "@/services/paystackService";
import { useToast } from "@/hooks/use-toast";

interface PaystackPaymentProps {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  metadata?: Record<string, any>;
  disabled?: boolean;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  amount,
  currency,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  className = "",
  children,
  metadata = {},
  disabled = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!paystackService.isCurrencySupported(currency)) {
      const error = `Currency ${currency} is not supported by Paystack`;
      onError?.(error);
      toast({
        title: "Payment Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData: PaymentData = {
        email: customerEmail,
        amount,
        currency,
        metadata: {
          customer_name: customerName,
          ...metadata,
        },
      };

      const response = await paystackService.initializePayment(paymentData);

      if (response.status && response.data?.authorization_url) {
        localStorage.setItem(
          "paystack_payment_reference",
          response.data.reference
        );
        localStorage.setItem(
          "paystack_payment_data",
          JSON.stringify({
            metadata
          })
        );
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error(response.message || "Failed to initialize payment");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment initialization failed";
      onError?.(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing || disabled}
      className={className}
    >
      {isProcessing ? "Processing..." : children || "Pay with Paystack"}
    </Button>
  );
};

export default PaystackPayment;
