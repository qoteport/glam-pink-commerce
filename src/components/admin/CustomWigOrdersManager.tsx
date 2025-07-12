import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Edit, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomWigOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  wig_type: string;
  length: string;
  color: string;
  texture: string;
  special_instructions: string;
  status: string;
  quoted_price: number | null;
  estimated_completion: string | null;
  created_at: string;
}

const CustomWigOrdersManager = () => {
  const [orders, setOrders] = useState<CustomWigOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'quoted', label: 'Quoted', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_wig_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom wig orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('custom_wig_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      fetchOrders();
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const updateOrderDetails = async (orderId: string, updates: Partial<CustomWigOrder>) => {
    try {
      const { error } = await supabase
        .from('custom_wig_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
      
      fetchOrders();
      toast({
        title: 'Success',
        description: 'Order details updated successfully',
      });
    } catch (error) {
      console.error('Error updating order details:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order details',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Wig Orders</h3>
        <div className="flex items-center space-x-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-lg">{order.customer_name}</h4>
                    <Badge className={getStatusBadge(order.status).color}>
                      {getStatusBadge(order.status).label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Contact Information</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {order.customer_email}
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {order.customer_phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Wig Specifications</h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Type:</span> {order.wig_type}</p>
                        {order.length && <p><span className="font-medium">Length:</span> {order.length}</p>}
                        {order.color && <p><span className="font-medium">Color:</span> {order.color}</p>}
                        {order.texture && <p><span className="font-medium">Texture:</span> {order.texture}</p>}
                      </div>
                    </div>
                  </div>

                  {order.special_instructions && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Special Instructions</h5>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {order.special_instructions}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-6 pt-2">
                    {order.quoted_price && (
                      <div className="flex items-center text-sm">
                        <DollarSign size={14} className="mr-1 text-green-600" />
                        <span className="font-medium">Quoted: ${order.quoted_price}</span>
                      </div>
                    )}
                    {order.estimated_completion && (
                      <div className="flex items-center text-sm">
                        <Calendar size={14} className="mr-1 text-blue-600" />
                        <span>Est. completion: {new Date(order.estimated_completion).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye size={16} className="mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details - {order.customer_name}</DialogTitle>
                      </DialogHeader>
                      <OrderDetailsForm order={order} onUpdate={updateOrderDetails} />
                    </DialogContent>
                  </Dialog>

                  <Select
                    value={order.status}
                    onValueChange={(status) => updateOrderStatus(order.id, status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No custom wig orders found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const OrderDetailsForm = ({ 
  order, 
  onUpdate 
}: { 
  order: CustomWigOrder; 
  onUpdate: (orderId: string, updates: Partial<CustomWigOrder>) => void;
}) => {
  const [formData, setFormData] = useState({
    quoted_price: order.quoted_price?.toString() || '',
    estimated_completion: order.estimated_completion || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<CustomWigOrder> = {};
    if (formData.quoted_price) {
      updates.quoted_price = Number(formData.quoted_price);
    }
    if (formData.estimated_completion) {
      updates.estimated_completion = formData.estimated_completion;
    }

    onUpdate(order.id, updates);
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div>
        <h4 className="font-medium mb-3">Customer Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="font-medium">Name</Label>
            <p>{order.customer_name}</p>
          </div>
          <div>
            <Label className="font-medium">Email</Label>
            <p>{order.customer_email}</p>
          </div>
          <div>
            <Label className="font-medium">Phone</Label>
            <p>{order.customer_phone || 'Not provided'}</p>
          </div>
          <div>
            <Label className="font-medium">Order Date</Label>
            <p>{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Wig Specifications */}
      <div>
        <h4 className="font-medium mb-3">Wig Specifications</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="font-medium">Type</Label>
            <p>{order.wig_type}</p>
          </div>
          <div>
            <Label className="font-medium">Length</Label>
            <p>{order.length || 'Not specified'}</p>
          </div>
          <div>
            <Label className="font-medium">Color</Label>
            <p>{order.color || 'Not specified'}</p>
          </div>
          <div>
            <Label className="font-medium">Texture</Label>
            <p>{order.texture || 'Not specified'}</p>
          </div>
        </div>
        {order.special_instructions && (
          <div className="mt-4">
            <Label className="font-medium">Special Instructions</Label>
            <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{order.special_instructions}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Order Management */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="font-medium">Order Management</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quoted_price">Quoted Price ($)</Label>
            <Input
              id="quoted_price"
              type="number"
              step="0.01"
              value={formData.quoted_price}
              onChange={(e) => setFormData(prev => ({ ...prev, quoted_price: e.target.value }))}
              placeholder="Enter quoted price"
            />
          </div>
          <div>
            <Label htmlFor="estimated_completion">Estimated Completion</Label>
            <Input
              id="estimated_completion"
              type="date"
              value={formData.estimated_completion}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion: e.target.value }))}
            />
          </div>
        </div>
        <Button type="submit">Update Order Details</Button>
      </form>
    </div>
  );
};

export default CustomWigOrdersManager;