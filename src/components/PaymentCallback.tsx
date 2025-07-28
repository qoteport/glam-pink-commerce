
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paystackService } from '@/services/paystackService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        toast({
          title: 'Payment Error',
          description: 'No payment reference found',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await paystackService.verifyPayment(reference);
        
        if (response.status && response.data?.status === 'success') {
          setStatus('success');
          setPaymentData(response.data);
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully',
          });
        } else {
          setStatus('failed');
          toast({
            title: 'Payment Failed',
            description: response.message || 'Payment verification failed',
            variant: 'destructive',
          });
        }
      } catch (error) {
        setStatus('failed');
        const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
        toast({
          title: 'Payment Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {status === 'verifying' && <Loader2 className="animate-spin" size={24} />}
            {status === 'success' && <CheckCircle className="text-green-500" size={24} />}
            {status === 'failed' && <XCircle className="text-red-500" size={24} />}
            <span>
              {status === 'verifying' && 'Verifying Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'verifying' && (
            <p className="text-center text-gray-600">
              Please wait while we verify your payment...
            </p>
          )}
          
          {status === 'success' && paymentData && (
            <div className="space-y-2">
              <p className="text-center text-gray-600">
                Thank you for your purchase! Your order is being processed.
              </p>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm"><strong>Reference:</strong> {paymentData.reference}</p>
                <p className="text-sm"><strong>Amount:</strong> {paymentData.currency} {(paymentData.amount / 100).toFixed(2)}</p>
              </div>
            </div>
          )}
          
          {status === 'failed' && (
            <p className="text-center text-gray-600">
              Your payment could not be processed. Please try again or contact support.
            </p>
          )}
          
          <Button 
            onClick={handleContinue}
            className="w-full"
            disabled={status === 'verifying'}
          >
            {status === 'success' ? 'Continue Shopping' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
