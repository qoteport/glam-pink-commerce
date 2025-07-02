-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, name),
  UNIQUE(category_id, slug)
);

-- Create discounts table
CREATE TABLE public.discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
  value NUMERIC NOT NULL,
  minimum_order_amount NUMERIC DEFAULT 0,
  maximum_discount_amount NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add discount fields to products table
ALTER TABLE public.products 
ADD COLUMN discount_id UUID REFERENCES public.discounts(id) ON DELETE SET NULL,
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for subcategories
CREATE POLICY "Anyone can view active subcategories" 
ON public.subcategories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage subcategories" 
ON public.subcategories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for discounts
CREATE POLICY "Anyone can view active discounts" 
ON public.discounts 
FOR SELECT 
USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage discounts" 
ON public.discounts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON public.discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, is_active, sort_order) VALUES
('Wigs', 'wigs', 'Premium quality wigs in various styles and textures', true, 1),
('Bundles', 'bundles', 'Virgin hair bundles for weaving and extensions', true, 2),
('Closures', 'closures', 'Lace closures for natural-looking hair parts', true, 3),
('Frontals', 'frontals', 'Lace frontals for ear-to-ear coverage', true, 4);

-- Insert default subcategories
WITH category_ids AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.subcategories (category_id, name, slug, description, is_active, sort_order)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  true,
  sub.sort_order
FROM category_ids c
CROSS JOIN (
  VALUES 
    -- Wig subcategories
    ('wigs', 'Lace Front', 'lace-front', 'Natural hairline with lace front construction', 1),
    ('wigs', 'HD Lace', 'hd-lace', 'Invisible HD lace for seamless blending', 2),
    ('wigs', '360 Lace', '360-lace', 'Full lace coverage around the perimeter', 3),
    ('wigs', 'Bob', 'bob', 'Chic bob style wigs', 4),
    ('wigs', 'Headband', 'headband', 'Convenient headband style wigs', 5),
    -- Bundle subcategories
    ('bundles', '3 Bundle Deal', '3-bundle-deal', 'Set of 3 hair bundles', 1),
    ('bundles', '4 Bundle Deal', '4-bundle-deal', 'Set of 4 hair bundles', 2),
    ('bundles', 'Single Bundle', 'single-bundle', 'Individual hair bundle', 3),
    -- Closure subcategories
    ('closures', '4x4 Closure', '4x4-closure', '4x4 inch lace closure', 1),
    ('closures', '5x5 Closure', '5x5-closure', '5x5 inch lace closure', 2),
    ('closures', 'Silk Base Closure', 'silk-base-closure', 'Silk base closure for natural scalp look', 3),
    -- Frontal subcategories
    ('frontals', '13x4 Frontal', '13x4-frontal', '13x4 inch lace frontal', 1),
    ('frontals', '13x6 Frontal', '13x6-frontal', '13x6 inch lace frontal', 2)
) AS sub(category_slug, name, slug, description, sort_order)
WHERE c.slug = sub.category_slug;