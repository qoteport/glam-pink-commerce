import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paystackService } from "@/services/paystackService";
import { orderService } from "@/services/orderService";
import { addressService, UserAddress } from "@/services/addressService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { clearCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying"
  );
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        toast({
          title: "Payment Error",
          description: "No payment reference found",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await paystackService.verifyPayment(reference);

        if (response.status && response.data?.status === "success") {
          setStatus("success");
          setPaymentData(response.data);
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully",
          });

          try {
              // Retrieve stored payment data
              const storedData = localStorage.getItem("paystack_payment_data");
              if (!storedData) {
                throw new Error("Payment data not found");
              }

              const metadata = JSON.parse(storedData);
              const shippingAddress = metadata.metadata.shipping_address;
              const orderData = metadata.metadata.order_data || {};
              const items = metadata.metadata.items || [];

              // Create order in database
              orderData.payment_reference = reference;
              const order = await orderService.createOrder(orderData);

              // Update payment status
              await orderService.updatePaymentStatus(
                order.id,
                "completed",
                reference
              );

              // Create notification
              if (orderData.customer_id) {
                await orderService.createNotification({
                  order_id: order.id,
                  user_id: orderData.customer_id,
                  type: "payment_success",
                  title: "Payment Successful",
                  message: `Your payment of ${(orderData.total_amount / 100).toFixed(
                    2
                  )} has been processed successfully.`,
                });
              }

              // Save address if requested
              if (shippingAddress?.saveAddress && orderData.customer_id) {
                const addressData = {
                  type: "shipping",
                  first_name: shippingAddress.firstName,
                  last_name: shippingAddress.lastName,
                  phone: shippingAddress.phone,
                  address: shippingAddress.address,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  zip_code: shippingAddress.zipCode,
                  country: shippingAddress.country,
                  is_default: false,
                  user_id: orderData.customer_id,
                } as UserAddress;

                await addressService.saveAddress(addressData);
              }
            

            clearCart();
            localStorage.removeItem("paystack_payment_reference");
            localStorage.removeItem("paystack_payment_data");
          } catch (error) {
            console.error("Error Occured Storing Errro data:", error)
          }
        } else {
          setStatus("failed");
          toast({
            title: "Payment Failed",
            description: response.message || "Payment verification failed",
            variant: "destructive",
          });
        }
      } catch (error) {
        setStatus("failed");
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Payment verification failed";
        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex flex-col items-center gap-3">
            {status === "verifying" && (
              <Loader2 className="animate-spin text-muted-foreground" size={40} />
            )}
            {status === "success" && (
              <CheckCircle className="text-green-500" size={48} />
            )}
            {status === "failed" && (
              <XCircle className="text-destructive" size={48} />
            )}
            <span className="text-xl">
              {status === "verifying" && "Verifying Payment..."}
              {status === "success" && "Thank You for Your Order!"}
              {status === "failed" && "Payment Failed"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "verifying" && (
            <p className="text-center text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          )}

          {status === "success" && paymentData && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Your payment was successful and your order is being processed. We'll notify you with updates!
              </p>
              <div className="bg-green-50 p-4 rounded-lg space-y-1">
                <p className="text-sm">
                  <strong>Reference:</strong> {paymentData.reference}
                </p>
                <p className="text-sm">
                  <strong>Amount:</strong> {paymentData.currency}{" "}
                  {(paymentData.amount / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate("/my-orders")} className="w-full">
                  View My Orders
                </Button>
                <Button onClick={() => navigate("/shop")} variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Your payment could not be processed. Please try again or contact support.
              </p>
              <Button onClick={() => navigate("/checkout")} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
