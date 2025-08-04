import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shippingService } from '@/services/shippingService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [taxBreakdown, setTaxBreakdown] = useState<{ breakdown: Array<{name: string, amount: number, rate: number}>, singleTax: {name: string, amount: number} | null }>({ breakdown: [], singleTax: null });
  const [customerCountry, setCustomerCountry] = useState('all');
  const [loading, setLoading] = useState(false);

  const subtotal = getTotalPrice();

  useEffect(() => {
    if (user) {
      fetchCustomerLocation();
    }
    calculateCosts();
  }, [items, user, customerCountry]);

  const fetchCustomerLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('country')
        .eq('user_id', user?.id)
        .single();

      if (data && data.country) {
        setCustomerCountry(data.country);
      }
    } catch (error) {
      console.log('No customer location found, using default');
    }
  };

  const calculateCosts = async () => {
    if (items.length === 0) {
      setShippingCost(0);
      setTaxAmount(0);
      setTaxBreakdown({ breakdown: [], singleTax: null });
      return;
    }

    setLoading(true);
    try {
      // Calculate shipping with customer country
      const shipping = await shippingService.calculateShipping(subtotal, items, customerCountry);
      setShippingCost(shipping);

      // Calculate tax
      const tax = await shippingService.calculateTax(subtotal, customerCountry);
      setTaxAmount(tax);

      // Get tax breakdown
      const breakdown = await shippingService.getTaxBreakdown(tax);
      setTaxBreakdown(breakdown);
    } catch (error) {
      console.error('Error calculating costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + shippingCost + taxAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 text-center">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button onClick={() => navigate('/shop')} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedColor}-${item.selectedLength}`} className="flex gap-4 p-4 border rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="flex gap-2 mt-1">
                        {item.selectedColor && (
                          <Badge variant="secondary">{item.selectedColor}</Badge>
                        )}
                        {item.selectedLength && (
                          <Badge variant="secondary">{item.selectedLength}</Badge>
                        )}
                      </div>
                      <p className="text-lg font-bold text-rose-600 mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedLength)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor, item.selectedLength)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor, item.selectedLength)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {loading ? 'Calculating...' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                {/* Tax Breakdown */}
                {taxAmount > 0 && (
                  <div className="space-y-2">
                    {taxBreakdown.singleTax ? (
                      <div className="flex justify-between">
                        <span>{taxBreakdown.singleTax.name}</span>
                        <span>${taxBreakdown.singleTax.amount.toFixed(2)}</span>
                      </div>
                    ) : (
                      taxBreakdown.breakdown.map((tax, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{tax.name}</span>
                          <span>${tax.amount.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    {loading ? 'Calculating...' : `$${total.toFixed(2)}`}
                  </span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  disabled={loading}
                >
                  Proceed to Checkout
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/shop')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
