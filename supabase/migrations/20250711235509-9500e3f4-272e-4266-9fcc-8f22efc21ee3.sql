-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Anyone can view active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample testimonials
INSERT INTO public.testimonials (name, email, rating, comment, location, is_featured, display_order) VALUES
('Sarah Johnson', 'sarah@example.com', 5, 'Absolutely love my new wig! The quality is amazing and it looks so natural. I get compliments everywhere I go!', 'Atlanta, GA', true, 1),
('Maria Rodriguez', 'maria@example.com', 5, 'Best hair extensions I have ever purchased. The color match is perfect and they blend seamlessly with my natural hair.', 'Miami, FL', true, 2),
('Jessica Chen', 'jessica@example.com', 4, 'Great quality bundles! Fast shipping and excellent customer service. Will definitely order again.', 'Los Angeles, CA', false, 3),
('Aisha Williams', 'aisha@example.com', 5, 'The wholesale deals are incredible! Perfect for my salon business. High quality at great prices.', 'Chicago, IL', true, 4);