
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create products table to replace the static data
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('wigs', 'bundles', 'closures', 'frontals')),
  subcategory TEXT,
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  colors TEXT[] DEFAULT '{}',
  lengths TEXT[] DEFAULT '{}',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  hair_type TEXT,
  texture TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile and assign role on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample products data
INSERT INTO public.products (name, price, original_price, rating, review_count, image, category, subcategory, is_best_seller, colors, lengths, description, features, hair_type, texture) VALUES
('Brazilian Curly Lace Front Wig', 299, 399, 4.9, 156, '/placeholder-wig-1.jpg', 'wigs', 'Lace Front', true, ARRAY['#8B4513', '#D2B48C', '#000000'], ARRAY['16', '18', '20', '22'], 'Premium Brazilian curly lace front wig with natural hairline and breathable cap.', ARRAY['100% Virgin Hair', 'Pre-plucked Hairline', 'Bleached Knots', 'Natural Density'], 'Virgin Brazilian', 'Curly'),
('Straight HD Lace Frontal Wig', 249, 329, 4.8, 98, '/placeholder-wig-2.jpg', 'wigs', 'HD Lace', false, ARRAY['#000000', '#8B4513', '#654321'], ARRAY['14', '16', '18', '20'], 'Invisible HD lace frontal wig with silky straight texture.', ARRAY['HD Lace', 'Glueless Install', 'Natural Scalp', '150% Density'], 'Virgin Peruvian', 'Straight'),
('Deep Wave 360 Lace Wig', 349, 449, 4.9, 87, '/placeholder-wig-3.jpg', 'wigs', '360 Lace', true, ARRAY['#8B4513', '#000000', '#D2B48C'], ARRAY['18', '20', '22', '24'], '360 lace wig with gorgeous deep wave pattern and full coverage.', ARRAY['360° Lace Coverage', 'Deep Wave Pattern', 'Medium Cap', '180% Density'], 'Virgin Malaysian', 'Deep Wave'),
('Body Wave Hair Bundle Set', 199, 279, 4.7, 203, '/placeholder-bundle-1.jpg', 'bundles', NULL, false, ARRAY['#000000', '#8B4513', '#D2B48C', '#654321'], ARRAY['16', '18', '20'], 'Premium body wave hair bundles - set of 3.', ARRAY['100% Virgin Hair', 'Machine Weft', 'No Shedding', 'Can Be Dyed'], 'Virgin Brazilian', 'Body Wave'),
('Straight Hair Bundles', 159, 219, 4.8, 167, '/placeholder-bundle-2.jpg', 'bundles', NULL, true, ARRAY['#000000', '#8B4513'], ARRAY['14', '16', '18', '20'], 'Silky straight hair bundles with natural shine.', ARRAY['Premium Grade', 'Double Weft', 'Heat Resistant', 'Long Lasting'], 'Virgin Peruvian', 'Straight');
