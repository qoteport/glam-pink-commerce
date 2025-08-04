import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { orderService, Order } from '@/services/orderService';
import PriceDisplay from '@/components/PriceDisplay';
import OrderDetails from '@/components/OrderDetails';

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const cartItems = await orderService.reorder(orderId);
      cartItems.forEach(item => {
        addToCart(item, item.quantity, item.selectedColor, item.selectedLength);
      });
      
      toast({
        title: 'Success',
        description: 'Items added to cart successfully',
      });
    } catch (error) {
      console.error('Error reordering:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder items',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Package className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-4">You need to be signed in to view your orders.</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your orders and view order history</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Button onClick={() => window.location.href = '/shop'}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(order.order_status)} flex items-center gap-1`}>
                      {getStatusIcon(order.order_status)}
                      {order.order_status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blush-100 to-cream-100 rounded overflow-hidden flex-shrink-0">
                            {item.product_image && (
                              <img 
                                src={item.product_image} 
                                alt={item.product_name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity}
                              {item.selected_color && ` • ${item.selected_color}`}
                              {item.selected_length && ` • ${item.selected_length}"`}
                            </p>
                          </div>
                          <PriceDisplay price={item.total_price} showOriginalPrice={false} className="text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <PriceDisplay price={order.subtotal} showOriginalPrice={false} />
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <PriceDisplay price={order.shipping_amount} showOriginalPrice={false} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Tax (estimated):</span>
                          <PriceDisplay price={order.tax_amount} showOriginalPrice={false} />
                        </div>
                        {order.tax_amount > 0 && (
                          <div className="text-xs text-gray-500 ml-4">
                            <div className="flex justify-between">
                              <span>• VAT/GST:</span>
                              <PriceDisplay price={order.tax_amount * 0.8} showOriginalPrice={false} className="text-xs" />
                            </div>
                            <div className="flex justify-between">
                              <span>• Service Tax:</span>
                              <PriceDisplay price={order.tax_amount * 0.2} showOriginalPrice={false} className="text-xs" />
                            </div>
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <PriceDisplay price={order.total_amount} showOriginalPrice={false} />
                      </div>
                    </div>

                    {order.tracking_number && (
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium">Tracking Number:</p>
                        <p className="text-sm text-blue-600">{order.tracking_number}</p>
                      </div>
                    )}

                    {order.estimated_delivery_date && (
                      <div className="mt-4 p-3 bg-green-50 rounded">
                        <p className="text-sm font-medium">Estimated Delivery:</p>
                        <p className="text-sm text-green-600">
                          {new Date(order.estimated_delivery_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleViewDetails(order)}
                    className="flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleReorder(order.id)}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Reorder
                  </Button>
                  {order.payment_status === 'failed' && (
                    <Button 
                      variant="default"
                      onClick={() => window.location.href = `/checkout?retry=${order.id}`}
                      className="bg-blush-600 hover:bg-blush-700"
                    >
                      Retry Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OrderDetails 
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default MyOrders;
