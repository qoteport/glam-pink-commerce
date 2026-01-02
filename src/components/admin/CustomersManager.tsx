import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, ShoppingCart, Package, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import PriceDisplay from '@/components/PriceDisplay';

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Order {
  id: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

interface CartItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  selected_color: string | null;
  selected_length: string | null;
  created_at: string;
}

const CustomersManager = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerCart, setCustomerCart] = useState<CartItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
    setDetailsLoading(true);

    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_status, payment_status, total_amount, created_at')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setCustomerOrders(orders || []);

      // Fetch cart items
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false });

      if (cartError) throw cartError;
      setCustomerCart(cartItems || []);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customer details',
        variant: 'destructive',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Customers</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View customer profiles, orders, and abandoned carts
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blush-400 to-rosegold-400 rounded-full flex items-center justify-center text-white font-medium">
                            {customer.full_name?.charAt(0)?.toUpperCase() || customer.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-medium">
                            {customer.full_name || 'No Name'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(customer.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchCustomerDetails(customer)}
                        >
                          <Eye size={16} className="mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blush-400 to-rosegold-400 rounded-full flex items-center justify-center text-white font-medium text-lg">
                {selectedCustomer?.full_name?.charAt(0)?.toUpperCase() || selectedCustomer?.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div>{selectedCustomer?.full_name || 'No Name'}</div>
                <div className="text-sm font-normal text-gray-500">{selectedCustomer?.email}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="orders" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package size={16} />
                  Orders ({customerOrders.length})
                </TabsTrigger>
                <TabsTrigger value="cart" className="flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Cart ({customerCart.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                {customerOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <Card key={order.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                          <div className="text-right">
                            <PriceDisplay price={order.total_amount} className="font-semibold" />
                            <div className="flex gap-2 mt-1">
                              <Badge className={getStatusColor(order.order_status)}>
                                {order.order_status}
                              </Badge>
                              <Badge className={getStatusColor(order.payment_status)}>
                                {order.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cart" className="mt-4">
                {customerCart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Abandoned Cart:</strong> These items haven't been checked out yet.
                      </p>
                    </div>
                    {customerCart.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-center gap-4">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-gray-500">
                              {item.selected_color && `Color: ${item.selected_color}`}
                              {item.selected_color && item.selected_length && ' | '}
                              {item.selected_length && `Length: ${item.selected_length}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <PriceDisplay price={item.unit_price * item.quantity} className="font-semibold" />
                            <div className="text-xs text-gray-500">
                              Added {format(new Date(item.created_at), 'MMM d')}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Cart Total:</span>
                        <PriceDisplay 
                          price={customerCart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomersManager;
