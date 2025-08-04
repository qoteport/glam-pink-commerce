import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { paystackService, PaymentData } from "@/services/paystackService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PayOnDeleveryProps {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  onSuccess?: (reference?: string) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  metadata?: Record<string, any>;
  disabled?: boolean;
}

const PayOnDelevery: React.FC<PayOnDeleveryProps> = ({
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
    setIsProcessing(true);

    try {
      onSuccess(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Order initialization failed";
      onError?.(errorMessage);
      toast({
        title: "Order Error",
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
      {isProcessing ? "Processing..." : children || "Pay on Delivery"}
    </Button>
  );
};

export default PayOnDelevery;
