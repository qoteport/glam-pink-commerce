-- Create quote_requests table
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_whatsapp TEXT,
  company_name TEXT,
  business_type TEXT,
  products_interested TEXT,
  quantity_needed TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage quote requests" 
ON public.quote_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications" 
ON public.admin_notifications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create notifications" 
ON public.admin_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create trigger function to notify admins on new quote requests
CREATE OR REPLACE FUNCTION public.notify_admin_on_quote()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_id, reference_type)
  VALUES (
    'quote_request',
    'New Quote Request',
    'New quote request from ' || NEW.customer_name || ' (' || NEW.customer_email || ')',
    NEW.id,
    'quote_request'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for quote requests
CREATE TRIGGER on_quote_request_created
  AFTER INSERT ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_quote();

-- Create trigger function to notify admins on new orders
CREATE OR REPLACE FUNCTION public.notify_admin_on_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_id, reference_type)
  VALUES (
    'new_order',
    'New Order Received',
    'New order from ' || NEW.customer_name || ' - Total: ₵' || NEW.total_amount,
    NEW.id,
    'order'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for orders
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_order();

-- Create trigger function to notify admins on new reviews
CREATE OR REPLACE FUNCTION public.notify_admin_on_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_id, reference_type)
  VALUES (
    'new_review',
    'New Review Submitted',
    'New review from ' || NEW.customer_name || ' - Rating: ' || NEW.rating || '/5',
    NEW.id,
    'review'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for reviews
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_review();

-- Create trigger function to notify admins on custom wig orders
CREATE OR REPLACE FUNCTION public.notify_admin_on_custom_wig()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_id, reference_type)
  VALUES (
    'custom_wig_order',
    'New Custom Wig Order',
    'New custom wig order from ' || NEW.customer_name || ' - Type: ' || NEW.wig_type,
    NEW.id,
    'custom_wig_order'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for custom wig orders
CREATE TRIGGER on_custom_wig_order_created
  AFTER INSERT ON public.custom_wig_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_custom_wig();

-- Add updated_at trigger for quote_requests
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);