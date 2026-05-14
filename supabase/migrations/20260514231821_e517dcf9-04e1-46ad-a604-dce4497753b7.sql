
-- Enable RLS on exposed tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- ORDERS policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ORDER_STATUS_HISTORY policies
DROP POLICY IF EXISTS "Users view history of their orders" ON public.order_status_history;
CREATE POLICY "Users view history of their orders" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id
            AND (o.customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

DROP POLICY IF EXISTS "Admins manage order status history" ON public.order_status_history;
CREATE POLICY "Admins manage order status history" ON public.order_status_history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- USER_ADDRESSES policies
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.user_addresses;
CREATE POLICY "Users can view their own addresses" ON public.user_addresses
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.user_addresses;
CREATE POLICY "Users can insert their own addresses" ON public.user_addresses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own addresses" ON public.user_addresses;
CREATE POLICY "Users can update their own addresses" ON public.user_addresses
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.user_addresses;
CREATE POLICY "Users can delete their own addresses" ON public.user_addresses
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Tighten always-true INSERT policies for notification tables (admin-only inserts; system uses service role/triggers which bypass RLS)
DROP POLICY IF EXISTS "System can create notifications" ON public.admin_notifications;
CREATE POLICY "Admins can create admin notifications" ON public.admin_notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can create notifications" ON public.order_notifications;
CREATE POLICY "Admins can create order notifications" ON public.order_notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Set search_path on all SECURITY DEFINER / public functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.create_order_status_history() SET search_path = public;
ALTER FUNCTION public.notify_admin_on_quote() SET search_path = public;
ALTER FUNCTION public.notify_admin_on_order() SET search_path = public;
ALTER FUNCTION public.notify_admin_on_review() SET search_path = public;
ALTER FUNCTION public.notify_admin_on_custom_wig() SET search_path = public;
ALTER FUNCTION public.notify_user_on_order_status_change() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
