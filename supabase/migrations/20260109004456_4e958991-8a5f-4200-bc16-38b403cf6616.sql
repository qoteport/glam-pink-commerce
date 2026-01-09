-- Create collection_products join table to link products to collections
CREATE TABLE public.collection_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.product_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

-- Enable RLS
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view collection products
CREATE POLICY "Anyone can view collection products"
  ON public.collection_products
  FOR SELECT
  USING (true);

-- Admins can manage collection products
CREATE POLICY "Admins can manage collection products"
  ON public.collection_products
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_collection_products_collection ON public.collection_products(collection_id);
CREATE INDEX idx_collection_products_product ON public.collection_products(product_id);

-- Make customer_email nullable and customer_phone required for custom_wig_orders
ALTER TABLE public.custom_wig_orders 
  ALTER COLUMN customer_email DROP NOT NULL,
  ALTER COLUMN customer_phone SET NOT NULL;