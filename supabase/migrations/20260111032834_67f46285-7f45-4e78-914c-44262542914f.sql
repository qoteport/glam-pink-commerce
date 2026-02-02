-- Create trigger for new orders
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_order();

-- Create trigger for new quote requests
CREATE TRIGGER on_new_quote
  AFTER INSERT ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_quote();

-- Create trigger for new reviews
CREATE TRIGGER on_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_review();

-- Create trigger for custom wig orders
CREATE TRIGGER on_new_custom_wig
  AFTER INSERT ON public.custom_wig_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_custom_wig();

-- Create trigger for order status changes (user notifications)
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_on_order_status_change();

-- Create trigger for order status history
CREATE TRIGGER on_order_status_history
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_order_status_history();