-- Create wholesale_deals table
CREATE TABLE public.wholesale_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wholesale_deal_products junction table
CREATE TABLE public.wholesale_deal_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.wholesale_deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  wholesale_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_id, product_id)
);

-- Create custom_wig_orders table
CREATE TABLE public.custom_wig_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  wig_type TEXT NOT NULL,
  length TEXT,
  color TEXT,
  texture TEXT,
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  quoted_price NUMERIC,
  estimated_completion DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wholesale_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_wig_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wholesale_deals
CREATE POLICY "Anyone can view active wholesale deals" 
ON public.wholesale_deals 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage wholesale deals" 
ON public.wholesale_deals 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for wholesale_deal_products
CREATE POLICY "Anyone can view wholesale deal products" 
ON public.wholesale_deal_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage wholesale deal products" 
ON public.wholesale_deal_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for custom_wig_orders
CREATE POLICY "Anyone can create custom wig orders" 
ON public.custom_wig_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all custom wig orders" 
ON public.custom_wig_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage custom wig orders" 
ON public.custom_wig_orders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_wholesale_deals_updated_at
BEFORE UPDATE ON public.wholesale_deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_wig_orders_updated_at
BEFORE UPDATE ON public.custom_wig_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample wholesale deals
INSERT INTO public.wholesale_deals (name, description, min_quantity, discount_percentage) VALUES
('Bundle Deal Special', 'Great savings on bulk wig purchases', 5, 20),
('Salon Owner Package', 'Professional discounts for salon owners', 10, 30);

-- Insert sample wholesale deal products (using existing product IDs)
INSERT INTO public.wholesale_deal_products (deal_id, product_id, wholesale_price)
SELECT 
  (SELECT id FROM public.wholesale_deals WHERE name = 'Bundle Deal Special' LIMIT 1),
  id,
  price * 0.8
FROM public.products 
WHERE category = 'wigs'
LIMIT 3;

INSERT INTO public.wholesale_deal_products (deal_id, product_id, wholesale_price)
SELECT 
  (SELECT id FROM public.wholesale_deals WHERE name = 'Salon Owner Package' LIMIT 1),
  id,
  price * 0.7
FROM public.products 
WHERE category = 'bundles'
LIMIT 3;