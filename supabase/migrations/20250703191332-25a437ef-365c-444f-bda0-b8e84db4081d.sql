-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create policies for product images bucket
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Add new fields to products table
ALTER TABLE public.products 
ADD COLUMN hair_care_instructions TEXT,
ADD COLUMN type TEXT,
ADD COLUMN live_video_url TEXT,
ADD COLUMN best_seller_threshold INTEGER DEFAULT 50,
ADD COLUMN image_gallery TEXT[] DEFAULT '{}';

-- Update existing products to have default best seller threshold
UPDATE public.products SET best_seller_threshold = 50 WHERE best_seller_threshold IS NULL;