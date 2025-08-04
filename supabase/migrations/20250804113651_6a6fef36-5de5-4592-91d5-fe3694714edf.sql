
-- Add country field to shipping_rules table
ALTER TABLE shipping_rules ADD COLUMN country TEXT DEFAULT 'all';

-- Add shipping_rate field to store actual shipping costs
ALTER TABLE shipping_rules ADD COLUMN shipping_rate NUMERIC DEFAULT 0;

-- Add priority field for rule ordering
ALTER TABLE shipping_rules ADD COLUMN priority INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipping_rules_country ON shipping_rules(country);
CREATE INDEX IF NOT EXISTS idx_shipping_rules_active_priority ON shipping_rules(is_active, priority);

-- Update existing rules to have default values
UPDATE shipping_rules SET country = 'all', shipping_rate = 0, priority = 0 WHERE country IS NULL;

-- Create a table for predefined countries (optional but helpful for dropdowns)
CREATE TABLE IF NOT EXISTS countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for countries table
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Create policies for countries table
CREATE POLICY "Anyone can view active countries" 
  ON countries 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage countries" 
  ON countries 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert some common countries
INSERT INTO countries (name, code, currency) VALUES
  ('Ghana', 'GH', 'GHS'),
  ('Nigeria', 'NG', 'NGN'),
  ('Kenya', 'KE', 'KES'),
  ('South Africa', 'ZA', 'ZAR'),
  ('United States', 'US', 'USD'),
  ('United Kingdom', 'GB', 'GBP'),
  ('Canada', 'CA', 'CAD'),
  ('Australia', 'AU', 'AUD'),
  ('All Countries', 'ALL', 'USD')
ON CONFLICT (code) DO NOTHING;
