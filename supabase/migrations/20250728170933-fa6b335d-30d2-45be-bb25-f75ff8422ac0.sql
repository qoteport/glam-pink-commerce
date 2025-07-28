
-- Create table to store user shipping addresses
CREATE TABLE public.user_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'shipping', -- 'shipping' or 'billing'
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text NOT NULL DEFAULT 'Ghana',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own addresses" 
  ON public.user_addresses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addresses" 
  ON public.user_addresses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
  ON public.user_addresses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
  ON public.user_addresses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for shipping rules
CREATE TABLE public.shipping_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL, -- 'minimum_amount', 'product_category', 'product_specific'
  condition_value text NOT NULL, -- amount for minimum_amount, category for product_category, product_id for product_specific
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for shipping rules
ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shipping rules
CREATE POLICY "Admins can manage shipping rules" 
  ON public.shipping_rules 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active shipping rules" 
  ON public.shipping_rules 
  FOR SELECT 
  USING (is_active = true);

-- Create table for tax rules
CREATE TABLE public.tax_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  tax_rate numeric NOT NULL, -- percentage as decimal (e.g., 0.08 for 8%)
  applies_to text NOT NULL, -- 'all', 'category', 'location'
  condition_value text, -- category name or location for specific rules
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for tax rules
ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tax rules
CREATE POLICY "Admins can manage tax rules" 
  ON public.tax_rules 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active tax rules" 
  ON public.tax_rules 
  FOR SELECT 
  USING (is_active = true);

-- Create table for platform settings
CREATE TABLE public.platform_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for platform settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for platform settings
CREATE POLICY "Admins can manage platform settings" 
  ON public.platform_settings 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view platform settings" 
  ON public.platform_settings 
  FOR SELECT 
  USING (true);

-- Insert default settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) VALUES
  ('default_currency', 'USD', 'Default currency shown to users before location detection'),
  ('base_currency', 'GHS', 'Base currency for admin price entry'),
  ('free_shipping_threshold', '75', 'Minimum order amount for free shipping in USD'),
  ('default_tax_rate', '0.08', 'Default tax rate as decimal');

-- Add updated_at triggers
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_shipping_rules_updated_at
  BEFORE UPDATE ON public.shipping_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tax_rules_updated_at
  BEFORE UPDATE ON public.tax_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
