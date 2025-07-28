
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PriceDisplay from '@/components/PriceDisplay';
import PaystackPayment from '@/components/PaystackPayment';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ghana',
    notes: ''
  });

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePaystackSuccess = (reference: string) => {
    toast({
      title: "Payment Successful",
      description: `Order placed successfully! Reference: ${reference}`,
    });
    clearCart();
    navigate('/');
  };

  const handlePaystackError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.address && formData.city && formData.state && formData.zipCode;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cart')}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Cart
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2" size={20} />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}-${item.selectedLength}`} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blush-100 to-cream-100 rounded overflow-hidden flex-shrink-0">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                            {item.selectedColor && ` • Color: ${item.selectedColor}`}
                            {item.selectedLength && ` • Length: ${item.selectedLength}"`}
                          </p>
                        </div>
                      </div>
                      <PriceDisplay 
                        price={item.price * item.quantity} 
                        showOriginalPrice={false}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <PriceDisplay price={subtotal} showOriginalPrice={false} />
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'Free' : <PriceDisplay price={shipping} showOriginalPrice={false} />}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <PriceDisplay price={tax} showOriginalPrice={false} />
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <PriceDisplay price={total} showOriginalPrice={false} className="text-blush-600" />
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                {isFormValid && user ? (
                  <PaystackPayment
                    amount={total}
                    currency="GHS"
                    customerEmail={formData.email}
                    customerName={`${formData.firstName} ${formData.lastName}`}
                    onSuccess={handlePaystackSuccess}
                    onError={handlePaystackError}
                    className="w-full bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-3"
                    metadata={{
                      shipping_address: formData,
                      items: items.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        selectedColor: item.selectedColor,
                        selectedLength: item.selectedLength
                      }))
                    }}
                  >
                    Complete Order with Paystack
                  </PaystackPayment>
                ) : (
                  <Button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 font-semibold py-3"
                  >
                    {!user ? 'Please sign in to continue' : 'Please fill in all required fields'}
                  </Button>
                )}

                {!user && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In to Complete Order
                  </Button>
                )}

                {/* Trust Badges */}
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 pt-4">
                  <div className="flex items-center">
                    <Shield size={16} className="mr-1" />
                    Secure
                  </div>
                  <div className="flex items-center">
                    <Truck size={16} className="mr-1" />
                    Free Shipping $75+
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
