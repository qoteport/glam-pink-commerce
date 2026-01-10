-- Create table for hero carousel products
CREATE TABLE public.hero_carousel_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_setting_id UUID REFERENCES public.hero_settings(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_carousel_products ENABLE ROW LEVEL SECURITY;

-- Public read access (hero is public)
CREATE POLICY "Hero carousel products are viewable by everyone" 
ON public.hero_carousel_products 
FOR SELECT 
USING (true);

-- Admin insert/update/delete (managed via service role in admin)
CREATE POLICY "Admins can manage hero carousel products" 
ON public.hero_carousel_products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create unique constraint to prevent duplicate products in same hero
CREATE UNIQUE INDEX idx_hero_carousel_unique ON public.hero_carousel_products(hero_setting_id, product_id);