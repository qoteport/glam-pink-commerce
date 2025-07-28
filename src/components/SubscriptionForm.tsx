
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert([
          {
            email: email.trim().toLowerCase(),
            user_id: user?.id || null,
            is_active: true
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Already subscribed',
            description: 'This email is already subscribed to our newsletter',
            variant: 'default',
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: 'Success!',
          description: 'You have been successfully subscribed to our newsletter',
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 font-medium">Successfully subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
      <div className="flex-1">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="bg-gradient-pink-vibrant text-white hover:opacity-90 whitespace-nowrap"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Subscribe
          </>
        )}
      </Button>
    </form>
  );
};

export default SubscriptionForm;
