-- Create offers table for time-bound offers
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  banner_image TEXT,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer_products junction table
CREATE TABLE public.offer_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  offer_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(offer_id, product_id)
);

-- Enable RLS on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offers
CREATE POLICY "Anyone can view active offers" 
ON public.offers 
FOR SELECT 
USING (is_active = true AND start_date <= now() AND end_date > now());

CREATE POLICY "Admins can manage offers" 
ON public.offers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for offer_products
CREATE POLICY "Anyone can view offer products" 
ON public.offer_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage offer products" 
ON public.offer_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add offer_id to orders table to track offer orders
ALTER TABLE public.orders ADD COLUMN offer_id UUID REFERENCES public.offers(id);

-- Create index for performance
CREATE INDEX idx_offers_dates ON public.offers(start_date, end_date);
CREATE INDEX idx_offers_active ON public.offers(is_active);
CREATE INDEX idx_offer_products_offer_id ON public.offer_products(offer_id);
CREATE INDEX idx_orders_offer_id ON public.orders(offer_id);