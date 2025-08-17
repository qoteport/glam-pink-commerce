import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, Truck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { shippingService } from "@/services/shippingService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PriceDisplay from "@/components/PriceDisplay";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [taxBreakdown, setTaxBreakdown] = useState<{
    breakdown: Array<{ name: string; amount: number; rate: number }>;
    singleTax: { name: string; amount: number } | null;
  }>({ breakdown: [], singleTax: null });
  const [customerCountry, setCustomerCountry] = useState("all");
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
        .from("user_locations")
        .select("country")
        .eq("user_id", user?.id)
        .single();

      if (data && data.country) {
        setCustomerCountry(data.country);
      }
    } catch (error) {
      console.log("No customer location found, using default");
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
      const shipping = await shippingService.calculateShipping(
        subtotal,
        items,
        customerCountry
      );
      setShippingCost(shipping);

      // Calculate tax
      const tax = await shippingService.calculateTax(subtotal, customerCountry);
      setTaxAmount(tax);

      // Get tax breakdown
      const breakdown = await shippingService.getTaxBreakdown(tax);
      setTaxBreakdown(breakdown);
    } catch (error) {
      console.error("Error calculating costs:", error);
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + shippingCost + taxAmount;

  const getItemKey = (item: any) => {
    return `${item.id}-${item.selectedColor}-${item.selectedLength}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-center">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 text-center">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate("/shop")} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">
                  Cart Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 sm:px-6">
                {items.map((item) => (
                  <div
                    key={getItemKey(item)}
                    className="flex gap-3 p-3 border rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {item.name}
                      </h3>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.selectedColor && (
                          <Badge variant="secondary" className="text-xs">
                            {item.selectedColor}
                          </Badge>
                        )}
                        {item.selectedLength && (
                          <Badge variant="secondary" className="text-xs">
                            {item.selectedLength}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base sm:text-lg font-bold text-rose-600 mt-1 sm:mt-2">
                        <PriceDisplay price={item.price} className="py-1" />
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFromCart(getItemKey(item))}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>

                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateQuantity(getItemKey(item), item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateQuantity(getItemKey(item), item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 sm:px-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal</span>
                  <PriceDisplay
                    price={subtotal}
                    designCSS=""
                    className="py-0"
                  />
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Shipping</span>
                    {loading ? (
                      <span>Calculating...</span>
                    ) : (
                      <PriceDisplay
                        price={shippingCost}
                        designCSS=""
                        className="py-0"
                      />
                    )}
                  </div>
                )}

                {/* Tax Breakdown */}
                {taxAmount > 0 && (
                  <div className="space-y-1">
                    {taxBreakdown.singleTax ? (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>{taxBreakdown.singleTax.name}</span>
                        <PriceDisplay
                          price={taxBreakdown.singleTax.amount}
                          designCSS=""
                          className="py-0"
                        />
                      </div>
                    ) : (
                      taxBreakdown.breakdown.map((tax, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs sm:text-sm"
                        >
                          <span>{tax.name}</span>
                          <PriceDisplay
                            price={tax.amount}
                            designCSS=""
                            className="py-0"
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-base sm:text-lg font-semibold">
                  <span>Total</span>
                  {loading ? (
                    <span>Calculating...</span>
                  ) : (
                    <PriceDisplay price={total} designCSS="" className="py-0" />
                  )}
                </div>

                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={() => navigate("/checkout")}
                  disabled={loading}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => navigate("/shop")}
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