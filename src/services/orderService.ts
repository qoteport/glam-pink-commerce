
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/contexts/CartContext";

export interface Order {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  payment_reference?: string;
  failure_reason?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  shipping_address?: any;
  billing_address?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  order_status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_color?: string;
  selected_length?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface OrderNotification {
  id: string;
  order_id: string;
  user_id?: string;
  type: 'order_confirmation' | 'payment_success' | 'payment_failed' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

class OrderService {
  async createOrder(orderData: {
    customer_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    shipping_address: any;
    billing_address: any;
    notes?: string;
    payment_reference?: string;
    items: CartItem[];
  }): Promise<Order> {
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        shipping_amount: orderData.shipping_amount,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        notes: orderData.notes,
        payment_reference: orderData.payment_reference,
        order_status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      selected_color: item.selectedColor,
      selected_length: item.selectedLength
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return {
      ...order,
      order_status: order.order_status as Order['order_status'],
      payment_status: order.payment_status as Order['payment_status']
    };
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId);

    if (error) throw error;
  }

  async updatePaymentStatus(orderId: string, status: 'completed' | 'failed' | 'pay later', reference?: string, failureReason?: string): Promise<void> {
    const updateData: any = { payment_status: status };
    
    if (reference) updateData.payment_reference = reference;
    if (failureReason) updateData.failure_reason = failureReason;

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        order_status_history(*)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(order => ({
      ...order,
      order_status: order.order_status as Order['order_status'],
      payment_status: order.payment_status as Order['payment_status']
    }));
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        order_status_history(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(order => ({
      ...order,
      order_status: order.order_status as Order['order_status'],
      payment_status: order.payment_status as Order['payment_status']
    }));
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        order_status_history(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    
    return data ? {
      ...data,
      order_status: data.order_status as Order['order_status'],
      payment_status: data.payment_status as Order['payment_status']
    } : null;
  }

  async createNotification(notification: {
    order_id: string;
    user_id?: string;
    type: OrderNotification['type'];
    title: string;
    message: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('order_notifications')
      .insert([notification]);

    if (error) throw error;
  }

  async getUserNotifications(userId: string): Promise<OrderNotification[]> {
    const { data, error } = await supabase
      .from('order_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(notification => ({
      ...notification,
      type: notification.type as OrderNotification['type']
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('order_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async reorder(orderId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.product_id,
      name: item.product_name,
      price: item.unit_price,
      image: item.product_image || '',
      quantity: item.quantity,
      selectedColor: item.selected_color,
      selectedLength: item.selected_length
    }));
  }
}

export const orderService = new OrderService();
