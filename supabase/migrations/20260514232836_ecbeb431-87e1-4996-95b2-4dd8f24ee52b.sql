
-- 1. Hide email columns from anon role
REVOKE SELECT (customer_email) ON public.reviews FROM anon;
REVOKE SELECT (email) ON public.testimonials FROM anon;

-- 2. Tighten order_items INSERT - must reference an order owned by caller (or guest order with no customer)
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Users can create items for their own orders" ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.customer_id = auth.uid()
          OR (o.customer_id IS NULL AND auth.uid() IS NULL)
        )
    )
  );

-- 3. Scope admin subscriptions policy to authenticated only
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Restrict discount columns: revoke sensitive internal fields from anon/authenticated
REVOKE SELECT (usage_count, usage_limit, maximum_discount_amount) ON public.discounts FROM anon, authenticated;

-- 5. Drop overly broad public SELECT policy on storage.objects for product-images
-- Public buckets serve files directly via URL without needing a SELECT policy
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- 6. Revoke EXECUTE on internal trigger functions (only fired by triggers, not callable externally)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_order_status_history() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_quote() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_order() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_review() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_custom_wig() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_user_on_order_status_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
