
-- Add followers_count to social_links table
ALTER TABLE social_links ADD COLUMN followers_count INTEGER DEFAULT 0;

-- Create product_collections table for the ProductShowcase collections
CREATE TABLE product_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Crown',
  gradient TEXT NOT NULL DEFAULT 'from-blush-400 to-rosegold-400',
  item_count TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for product_collections
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Create policies for product_collections
CREATE POLICY "Admins can manage product collections" 
  ON product_collections 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active product collections" 
  ON product_collections 
  FOR SELECT 
  USING (is_active = true);

-- Insert default collections
INSERT INTO product_collections (name, description, icon, gradient, item_count, category, display_order) VALUES
('Lace Front Wigs', 'Natural hairline, breathable comfort', 'Crown', 'from-blush-400 to-rosegold-400', '120+ styles', 'wigs', 1),
('Hair Bundles', 'Premium virgin hair collections', 'Sparkles', 'from-rosegold-400 to-cream-400', '80+ bundles', 'bundles', 2),
('Closure & Frontals', 'Complete your perfect look', 'Star', 'from-cream-400 to-blush-400', '45+ options', 'closures', 3);

-- Create trigger for updated_at on product_collections
CREATE TRIGGER update_product_collections_updated_at
  BEFORE UPDATE ON product_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
