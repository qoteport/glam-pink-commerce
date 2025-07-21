
-- Create textures table
CREATE TABLE public.textures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hair_types table
CREATE TABLE public.hair_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.textures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hair_types ENABLE ROW LEVEL SECURITY;

-- Create policies for textures
CREATE POLICY "Anyone can view active textures" 
ON public.textures 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage textures" 
ON public.textures 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for hair_types
CREATE POLICY "Anyone can view active hair types" 
ON public.hair_types 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hair types" 
ON public.hair_types 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_textures_updated_at
  BEFORE UPDATE ON public.textures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hair_types_updated_at
  BEFORE UPDATE ON public.hair_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default textures
INSERT INTO public.textures (name, slug, description, is_active, sort_order) VALUES
('Straight', 'straight', 'Silky straight hair texture', true, 1),
('Body Wave', 'body-wave', 'Natural body wave texture', true, 2),
('Deep Wave', 'deep-wave', 'Rich deep wave texture', true, 3),
('Curly', 'curly', 'Beautiful curly hair texture', true, 4),
('Loose Wave', 'loose-wave', 'Gentle loose wave texture', true, 5),
('Water Wave', 'water-wave', 'Flowing water wave texture', true, 6);

-- Insert default hair types
INSERT INTO public.hair_types (name, slug, description, is_active, sort_order) VALUES
('Virgin Brazilian', 'virgin-brazilian', 'Premium Brazilian virgin hair', true, 1),
('Virgin Peruvian', 'virgin-peruvian', 'High-quality Peruvian virgin hair', true, 2),
('Virgin Malaysian', 'virgin-malaysian', 'Luxurious Malaysian virgin hair', true, 3),
('Virgin Indian', 'virgin-indian', 'Authentic Indian virgin hair', true, 4);
