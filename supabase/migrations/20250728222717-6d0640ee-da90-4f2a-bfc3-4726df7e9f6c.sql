
-- Add order status transitions and improve order management
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Create order status history table for tracking transitions
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for order status history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order status history" 
  ON public.order_status_history 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their order status history" 
  ON public.order_status_history 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- Add trigger for order status history
CREATE TRIGGER handle_updated_at_order_status_history
  BEFORE UPDATE ON public.order_status_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create status history when order status changes
CREATE OR REPLACE FUNCTION public.create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.order_status != NEW.order_status THEN
    INSERT INTO public.order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.order_status, 'Status changed from ' || OLD.order_status || ' to ' || NEW.order_status);
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.order_status, 'Order created');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status history
CREATE TRIGGER order_status_change_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_order_status_history();

-- Create order notifications table
CREATE TABLE IF NOT EXISTS public.order_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order_confirmation', 'payment_success', 'payment_failed', 'order_shipped', 'order_delivered', 'order_cancelled')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for notifications
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.order_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" 
  ON public.order_notifications 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create notifications" 
  ON public.order_notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_user_id ON public.order_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_order_id ON public.order_notifications(order_id);
