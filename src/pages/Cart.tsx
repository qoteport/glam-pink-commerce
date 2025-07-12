
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Minus, X, ShoppingBag, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag size={64} className="mx-auto text-blush-300 mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button 
              onClick={() => navigate('/shop')}
              className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600"
            >
              Start Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Continue Shopping
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">
              Shopping Cart ({getTotalItems()} items)
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.id}-${item.selectedColor}-${item.selectedLength}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blush-100 to-cream-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blush-600 font-bold text-lg">
                          {item.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(`${item.id}-${item.selectedColor}-${item.selectedLength}`)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </Button>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        {item.selectedColor && (
                          <div className="flex items-center">
                            <span>Color: </span>
                            <div 
                              className="w-4 h-4 rounded-full ml-2 border"
                              style={{ backgroundColor: item.selectedColor }}
                            ></div>
                          </div>
                        )}
                        {item.selectedLength && (
                          <p>Length: {item.selectedLength}"</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(`${item.id}-${item.selectedColor}-${item.selectedLength}`, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(`${item.id}-${item.selectedColor}-${item.selectedLength}`, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold text-lg text-blush-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${item.price} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blush-600">
                        ${(getTotalPrice() * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <Input placeholder="Enter promo code" className="flex-1" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-3"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 text-center space-y-2 text-sm text-gray-600">
                  <p>🔒 Secure checkout</p>
                  <p>↩️ 30-day returns</p>
                  <p>🚚 Free shipping on $75+</p>
                </div>
              </CardContent>
            </Card>

            {/* Recently Viewed */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">You might also like</h3>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blush-100 to-cream-100 rounded flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Related Product {i}</p>
                        <p className="text-sm text-blush-600 font-semibold">$199</p>
                      </div>
                    </div>
                  ))}
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

export default Cart;
