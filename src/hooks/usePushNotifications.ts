import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
  isLoading: boolean;
}

// VAPID public key - this should match the private key on the server
// For production, generate your own VAPID keys
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(userId?: string) {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    permission: 'default',
    isLoading: true,
  });
  const { toast } = useToast();

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 
                        'PushManager' in window && 
                        'Notification' in window;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }));
    
    return isSupported;
  }, []);

  // Register service worker and check subscription
  const initializePush = useCallback(async () => {
    if (!checkSupport()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Register the push service worker
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/'
      });
      
      console.log('Push SW registered:', registration);

      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!existingSubscription,
        subscription: existingSubscription,
        permission: Notification.permission,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error initializing push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkSupport]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        setState(prev => ({ 
          ...prev, 
          permission, 
          isLoading: false 
        }));
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('Push subscription:', subscription);

      // Store subscription in database if user is logged in
      if (userId) {
        await savePushSubscription(userId, subscription);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        permission: 'granted',
        isLoading: false,
      }));

      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive push notifications.',
      });

      return subscription;

    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Could not enable push notifications. Please try again.',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [state.isSupported, userId, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await state.subscription.unsubscribe();

      // Remove subscription from database
      if (userId) {
        await removePushSubscription(userId);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      });

    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: 'Error',
        description: 'Could not disable push notifications.',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.subscription, userId, toast]);

  // Save subscription to database
  const savePushSubscription = async (userId: string, subscription: PushSubscription) => {
    const subscriptionJson = subscription.toJSON();
    
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys?.p256dh,
        auth: subscriptionJson.keys?.auth,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving push subscription:', error);
    }
  };

  // Remove subscription from database
  const removePushSubscription = async (userId: string) => {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing push subscription:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializePush();
  }, [initializePush]);

  // Update subscription when user changes
  useEffect(() => {
    if (userId && state.subscription) {
      savePushSubscription(userId, state.subscription);
    }
  }, [userId, state.subscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission: subscribe,
  };
}
