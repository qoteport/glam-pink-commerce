-- Allow admins to view all user profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all cart items (for customer management)
CREATE POLICY "Admins can view all cart items"
  ON public.cart_items
  FOR SELECT
  TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any profile (for customer management)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));