-- Create table for managing social links
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for hero section settings
CREATE TABLE public.hero_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  featured_product_id UUID REFERENCES public.products(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  background_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Instagram settings and posts
CREATE TABLE public.instagram_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_handle TEXT,
  hashtag TEXT,
  display_feed BOOLEAN NOT NULL DEFAULT true,
  feed_title TEXT,
  feed_subtitle TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Instagram posts/content
CREATE TABLE public.instagram_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  post_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin management
CREATE POLICY "Admins can manage social links" 
ON public.social_links 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active social links" 
ON public.social_links 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hero settings" 
ON public.hero_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active hero settings" 
ON public.hero_settings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage instagram settings" 
ON public.instagram_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view instagram settings" 
ON public.instagram_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage instagram posts" 
ON public.instagram_posts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active instagram posts" 
ON public.instagram_posts 
FOR SELECT 
USING (is_active = true);

-- Create triggers for updated_at
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hero_settings_updated_at
BEFORE UPDATE ON public.hero_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instagram_settings_updated_at
BEFORE UPDATE ON public.instagram_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at
BEFORE UPDATE ON public.instagram_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.social_links (platform, url, display_order) VALUES
('Instagram', 'https://instagram.com/glamcrownbeauty', 1),
('Facebook', 'https://facebook.com/glamcrownbeauty', 2),
('TikTok', 'https://tiktok.com/@glamcrownbeauty', 3),
('Twitter', 'https://twitter.com/glamcrownbeauty', 4);

INSERT INTO public.hero_settings (title, subtitle, cta_text, cta_url) VALUES
('Unleash Your Inner Glam', 'Premium wigs and hair bundles that transform your look and boost your confidence. Join thousands of beautiful women who trust GlamCrown Beauty.', 'Shop Premium Wigs', '/shop');

INSERT INTO public.instagram_settings (instagram_handle, hashtag, feed_title, feed_subtitle) VALUES
('@glamcrownbeauty', '#GlamCrownLooks', 'See Real Results on Instagram', 'Tag us @glamcrownbeauty and use #GlamCrownLooks for a chance to be featured!');