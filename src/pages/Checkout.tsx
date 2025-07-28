
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PriceDisplay from '@/components/PriceDisplay';
import PaystackPayment from '@/components/PaystackPayment';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { addressService, UserAddress } from '@/services/addressService';
import { shippingService } from '@/services/shippingService';

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
    notes: '',
    saveAddress: false
  });

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [shipping, setShipping] = useState(9.99);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(false);

  const subtotal = getTotalPrice();
  const total = subtotal + tax + shipping;

  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user]);

  useEffect(() => {
    calculateShippingAndTax();
  }, [subtotal, items, formData.country]);

  const loadSavedAddresses = async () => {
    if (!user) return;
    
    const addresses = await addressService.getUserAddresses(user.id);
    setSavedAddresses(addresses);
    
    // Auto-select default address
    const defaultAddress = addresses.find(addr => addr.is_default);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id!);
      setFormData({
        email: user.email || '',
        firstName: defaultAddress.first_name,
        lastName: defaultAddress.last_name,
        phone: defaultAddress.phone || '',
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zip_code,
        country: defaultAddress.country,
        notes: '',
        saveAddress: false
      });
    }
  };

  const calculateShippingAndTax = async () => {
    try {
      const shippingCost = await shippingService.calculateShipping(subtotal, items);
      const taxCost = await shippingService.calculateTax(subtotal, formData.country);
      
      setShipping(shippingCost);
      setTax(taxCost);
    } catch (error) {
      console.error('Error calculating shipping and tax:', error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setFormData({
        email: user?.email || '',
        firstName: address.first_name,
        lastName: address.last_name,
        phone: address.phone || '',
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zip_code,
        country: address.country,
        notes: '',
        saveAddress: false
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePaystackSuccess = async (reference: string) => {
    // Save address if requested
    if (formData.saveAddress && user) {
      const addressData: UserAddress = {
        type: 'shipping',
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        is_default: savedAddresses.length === 0 // Make first address default
      };

      await addressService.saveAddress(addressData);
    }

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
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Saved Addresses</Label>
                    <div className="space-y-2">
                      {savedAddresses.map((address) => (
                        <div key={address.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`address-${address.id}`}
                            name="savedAddress"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => handleAddressSelect(address.id!)}
                            className="text-blush-600"
                          />
                          <label htmlFor={`address-${address.id}`} className="text-sm cursor-pointer">
                            {address.first_name} {address.last_name}, {address.address}, {address.city}, {address.state} {address.zip_code}
                            {address.is_default && <span className="text-blush-600 ml-2">(Default)</span>}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="new-address"
                          name="savedAddress"
                          value=""
                          checked={selectedAddressId === ''}
                          onChange={() => setSelectedAddressId('')}
                          className="text-blush-600"
                        />
                        <label htmlFor="new-address" className="text-sm cursor-pointer">
                          Use new address
                        </label>
                      </div>
                    </div>
                  </div>
                )}

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

                {user && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="saveAddress"
                      checked={formData.saveAddress}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, saveAddress: checked }))}
                    />
                    <Label htmlFor="saveAddress">Save this address for future orders</Label>
                  </div>
                )}
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
                    Dynamic Shipping
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
