
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, CheckCircle, XCircle, MapPin, CreditCard, Truck } from 'lucide-react';
import { Order } from '@/services/orderService';
import PriceDisplay from '@/components/PriceDisplay';

interface OrderDetailsProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetails = ({ order, isOpen, onClose }: OrderDetailsProps) => {
  if (!order) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order #{order.id.substring(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`${getStatusColor(order.order_status)} flex items-center gap-1`}>
                {getStatusIcon(order.order_status)}
                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
              </Badge>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                <CreditCard className="w-3 h-3 mr-1" />
                Payment {order.payment_status}
              </Badge>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-blush-100 to-cream-100 rounded overflow-hidden flex-shrink-0">
                    {item.product_image && (
                      <img 
                        src={item.product_image} 
                        alt={item.product_name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Quantity: {item.quantity}</p>
                      {item.selected_color && <p>Color: {item.selected_color}</p>}
                      {item.selected_length && <p>Length: {item.selected_length}"</p>}
                      <p>Unit Price: <PriceDisplay price={item.unit_price} showOriginalPrice={false} className="text-sm inline" /></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <PriceDisplay price={item.total_price} showOriginalPrice={false} className="font-semibold" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h3>
              {order.shipping_address ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">{order.customer_name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                  <p>{order.shipping_address.zip_code}</p>
                  <p>{order.shipping_address.country || 'Ghana'}</p>
                  {order.customer_phone && <p>Phone: {order.customer_phone}</p>}
                </div>
              ) : (
                <p className="text-gray-500">No shipping address provided</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Billing Address
              </h3>
              {order.billing_address ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">{order.customer_name}</p>
                  <p>{order.billing_address.address}</p>
                  <p>{order.billing_address.city}, {order.billing_address.state}</p>
                  <p>{order.billing_address.zip_code}</p>
                  <p>{order.billing_address.country || 'Ghana'}</p>
                </div>
              ) : (
                <p className="text-gray-500">Same as shipping address</p>
              )}
            </div>
          </div>

          {/* Order Summary with Enhanced Tax Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items):</span>
                <PriceDisplay price={order.subtotal} showOriginalPrice={false} />
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping & Handling:</span>
                <PriceDisplay price={order.shipping_amount} showOriginalPrice={false} />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Tax (estimated):</span>
                  <PriceDisplay price={order.tax_amount} showOriginalPrice={false} />
                </div>
                {order.tax_amount > 0 && (
                  <div className="text-xs text-gray-500 ml-4">
                    • VAT/GST: <PriceDisplay price={order.tax_amount * 0.8} showOriginalPrice={false} className="text-xs inline" />
                    <br />
                    • Service Tax: <PriceDisplay price={order.tax_amount * 0.2} showOriginalPrice={false} className="text-xs inline" />
                  </div>
                )}
              </div>
              
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount:</span>
                <PriceDisplay price={order.total_amount} showOriginalPrice={false} />
              </div>
            </div>
          </div>

          {/* Tracking & Delivery Info */}
          {(order.tracking_number || order.estimated_delivery_date) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping Information
              </h3>
              <div className="space-y-3">
                {order.tracking_number && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium text-blue-800">Tracking Number</p>
                    <p className="text-blue-600 font-mono">{order.tracking_number}</p>
                  </div>
                )}
                {order.estimated_delivery_date && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium text-green-800">Estimated Delivery</p>
                    <p className="text-green-600">
                      {new Date(order.estimated_delivery_date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Status History */}
          {order.order_status_history && order.order_status_history.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Order History</h3>
              <div className="space-y-3">
                {order.order_status_history.map((history) => (
                  <div key={history.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    <div className="flex-shrink-0">
                      {getStatusIcon(history.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{history.status}</p>
                      {history.notes && <p className="text-sm text-gray-600">{history.notes}</p>}
                      <p className="text-xs text-gray-500">
                        {new Date(history.created_at).toLocaleDateString()} at {new Date(history.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Payment Status:</span>
                <Badge className={getPaymentStatusColor(order.payment_status)}>
                  {order.payment_status}
                </Badge>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Payment Reference:</span>
                  <span className="text-sm font-mono">{order.payment_reference}</span>
                </div>
              )}
              {order.failure_reason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-800">Payment Failed</p>
                  <p className="text-sm text-red-600">{order.failure_reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;
