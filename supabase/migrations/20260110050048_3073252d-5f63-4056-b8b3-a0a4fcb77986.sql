-- Create trigger function to notify user on order status change
CREATE OR REPLACE FUNCTION public.notify_user_on_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only trigger on status change, not on insert
  IF TG_OP = 'UPDATE' AND OLD.order_status IS DISTINCT FROM NEW.order_status THEN
    INSERT INTO public.order_notifications (order_id, user_id, type, title, message)
    VALUES (
      NEW.id,
      NEW.customer_id,
      'status_update',
      'Order Status Updated',
      'Your order status has been updated to: ' || NEW.order_status
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS trigger_notify_user_on_order_status_change ON public.orders;
CREATE TRIGGER trigger_notify_user_on_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_on_order_status_change();