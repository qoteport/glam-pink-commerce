import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PriceDisplay from "@/components/PriceDisplay";
import PaystackPayment from "@/components/PaystackPayment";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addressService, UserAddress } from "@/services/addressService";
import { shippingService } from "@/services/shippingService";
import { orderService } from "@/services/orderService";
import PayOnDelevery from "@/components/PayonDelevery";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const retryOrderId = searchParams.get("retry");

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    notes: "",
    saveAddress: false,
  });

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [shipping, setShipping] = useState(9.99);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [retryOrder, setRetryOrder] = useState<any>(null);

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

  useEffect(() => {
    if (retryOrderId) {
      loadRetryOrder();
    }
  }, [retryOrderId]);

  const loadRetryOrder = async () => {
    if (!retryOrderId) return;

    try {
      const order = await orderService.getOrderById(retryOrderId);
      if (order && order.payment_status === "failed") {
        setRetryOrder(order);
        setPaymentError(
          order.failure_reason || "Payment failed. Please try again."
        );

        // Pre-fill form with order data
        if (order.shipping_address) {
          setFormData({
            email: order.customer_email,
            firstName: order.shipping_address.firstName || "",
            lastName: order.shipping_address.lastName || "",
            phone: order.shipping_address.phone || "",
            address: order.shipping_address.address || "",
            city: order.shipping_address.city || "",
            state: order.shipping_address.state || "",
            zipCode: order.shipping_address.zipCode || "",
            country: order.shipping_address.country || "Ghana",
            notes: order.notes || "",
            saveAddress: false,
          });
        }
      }
    } catch (error) {
      console.error("Error loading retry order:", error);
    }
  };

  const loadSavedAddresses = async () => {
    if (!user) return;

    const addresses = await addressService.getUserAddresses(user.id);
    setSavedAddresses(addresses);

    // Auto-select default address
    const defaultAddress = addresses.find((addr) => addr.is_default);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id!);
      setFormData({
        email: user.email || "",
        firstName: defaultAddress.first_name,
        lastName: defaultAddress.last_name,
        phone: defaultAddress.phone || "",
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zip_code,
        country: defaultAddress.country,
        notes: "",
        saveAddress: false,
      });
    }
  };

  const calculateShippingAndTax = async () => {
    try {
      const shippingCost = await shippingService.calculateShipping(
        subtotal,
        items
      );
      const taxCost = await shippingService.calculateTax(
        subtotal,
        formData.country
      );

      setShipping(shippingCost);
      setTax(taxCost);
    } catch (error) {
      console.error("Error calculating shipping and tax:", error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      setFormData({
        email: user?.email || "",
        firstName: address.first_name,
        lastName: address.last_name,
        phone: address.phone || "",
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zip_code,
        country: address.country,
        notes: "",
        saveAddress: false,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePaystackSuccess = async (reference?: string) => {
    try {
      setLoading(true);

      // Create order in database
      const orderData = {
        customer_id: user?.id,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        total_amount: total,
        subtotal: subtotal,
        tax_amount: tax,
        shipping_amount: shipping,
        shipping_address: formData,
        billing_address: formData,
        notes: formData.notes,
        payment_reference: reference || "",
        items: items,
      };

      const order = await orderService.createOrder(orderData);

      // Update payment status
      await orderService.updatePaymentStatus(order.id, "completed", reference);

      // Create notification
      if (user) {
        await orderService.createNotification({
          order_id: order.id,
          user_id: user.id,
          type: "payment_success",
          title: "Payment Successful",
          message: `Your payment of ${total.toFixed(
            2
          )} has been processed successfully.`,
        });
      }

      // Save address if requested

      if (formData.saveAddress && user) {
        const addressData: UserAddress = {
          type: "shipping",
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
          is_default: savedAddresses.length === 0,
        };

        await addressService.saveAddress(addressData);
      }

      toast({
        title: "Order Placed Successfully",
        description: `Order #${order.id.substring(
          0,
          8
        )} has been placed successfully!`,
      });

      clearCart();
      navigate("/my-orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackError = async (error: string) => {
    setPaymentError(error);

    // If this is a retry, update the order with failure reason
    if (retryOrder) {
      try {
        await orderService.updatePaymentStatus(
          retryOrder.id,
          "failed",
          undefined,
          error
        );

        if (user) {
          await orderService.createNotification({
            order_id: retryOrder.id,
            user_id: user.id,
            type: "payment_failed",
            title: "Payment Failed",
            message: `Payment failed: ${error}. Please try again.`,
          });
        }
      } catch (notificationError) {
        console.error(
          "Error creating failure notification:",
          notificationError
        );
      }
    }

    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handlePayLaterSuccess = async (reference?: string) => {
    try {
      setLoading(true);

      // Create order in database
      const orderData = {
        customer_id: user?.id,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        total_amount: total,
        subtotal: subtotal,
        tax_amount: tax,
        shipping_amount: shipping,
        shipping_address: formData,
        billing_address: formData,
        notes: formData.notes,
        payment_reference: reference || "",
        items: items,
      };

      const order = await orderService.createOrder(orderData);

      // Update payment status
      await orderService.updatePaymentStatus(order.id, "pay later", reference);

      // Create notification
      if (user) {
        await orderService.createNotification({
          order_id: order.id,
          user_id: user.id,
          type: "order_confirmation",
          title: "Order Placed Successful",
          message: `Your order has been placed successfully. You will be contacted for payment details.`,
        });
      }

      // Save address if requested

      if (formData.saveAddress && user) {
        const addressData: UserAddress = {
          type: "shipping",
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
          is_default: savedAddresses.length === 0,
        };

        await addressService.saveAddress(addressData);
      }

      toast({
        title: "Order Placed Successfully",
        description: `Order #${order.id.substring(
          0,
          8
        )} has been placed successfully!, You will be contacted for payment details.`,
      });

      clearCart();
      navigate("/my-orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !retryOrder) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mb-[70px]">
          <Header />
        </div>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Your cart is empty
          </h1>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.address &&
    formData.city &&
    formData.state &&
    formData.zipCode;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-[70px]">
        <Header />
      </div>

      <div className="md:container md:mx-auto px-0 mx-1 md:px-4 py-4 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(retryOrder ? "/my-orders" : "/cart")}
          className="md:mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          {retryOrder ? "Back to Orders" : "Back to Cart"}
        </Button>

        {retryOrder && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Retrying payment for Order #{retryOrder.id.substring(0, 8)}. Your
              order details have been preserved.
            </AlertDescription>
          </Alert>
        )}

        {paymentError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {paymentError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <Card className=" ">
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
                        <div
                          key={address.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            id={`address-${address.id}`}
                            name="savedAddress"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => handleAddressSelect(address.id!)}
                            className="text-blush-600"
                          />
                          <label
                            htmlFor={`address-${address.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {address.first_name} {address.last_name},{" "}
                            {address.address}, {address.city}, {address.state}{" "}
                            {address.zip_code}
                            {address.is_default && (
                              <span className="text-blush-600 ml-2">
                                (Default)
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="new-address"
                          name="savedAddress"
                          value=""
                          checked={selectedAddressId === ""}
                          onChange={() => setSelectedAddressId("")}
                          className="text-blush-600"
                        />
                        <label
                          htmlFor="new-address"
                          className="text-sm cursor-pointer"
                        >
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
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          saveAddress: checked,
                        }))
                      }
                    />
                    <Label htmlFor="saveAddress">
                      Save this address for future orders
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6 ">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {(retryOrder ? retryOrder.order_items : items).map(
                    (item: any) => (
                      <div
                        key={
                          retryOrder
                            ? item.id
                            : `${item.id}-${item.selectedColor}-${item.selectedLength}`
                        }
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blush-100 to-cream-100 rounded overflow-hidden flex-shrink-0">
                            {(retryOrder ? item.product_image : item.image) && (
                              <img
                                src={
                                  retryOrder ? item.product_image : item.image
                                }
                                alt={retryOrder ? item.product_name : item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {retryOrder ? item.product_name : item.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity}
                              {(retryOrder
                                ? item.selected_color
                                : item.selectedColor) &&
                                ` • Color: ${retryOrder
                                  ? item.selected_color
                                  : item.selectedColor
                                }`}
                              {(retryOrder
                                ? item.selected_length
                                : item.selectedLength) &&
                                ` • Length: ${retryOrder
                                  ? item.selected_length
                                  : item.selectedLength
                                }"`}
                            </p>
                          </div>
                        </div>
                        <PriceDisplay
                          price={
                            retryOrder
                              ? item.total_price
                              : item.price * item.quantity
                          }
                          showOriginalPrice={false}
                          className="text-sm"
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Subtotal (
                      {retryOrder
                        ? retryOrder.order_items?.length
                        : getTotalItems()}{" "}
                      items)
                    </span>
                    <PriceDisplay
                      price={retryOrder ? retryOrder.subtotal : subtotal}
                      showOriginalPrice={false}
                    />
                  </div>
                  {(shipping > 0 || retryOrder) && (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span
                        className={
                          (retryOrder
                            ? retryOrder.shipping_amount
                            : shipping) === 0
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {(retryOrder
                          ? retryOrder.shipping_amount
                          : shipping) === 0 ? (
                          "Free"
                        ) : (
                          <PriceDisplay
                            price={
                              retryOrder ? retryOrder.shipping_amount : shipping
                            }
                            showOriginalPrice={false}
                          />
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <PriceDisplay
                      price={retryOrder ? retryOrder.tax_amount : tax}
                      showOriginalPrice={false}
                    />
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <PriceDisplay
                        price={retryOrder ? retryOrder.total_amount : total}
                        showOriginalPrice={false}
                        className="text-blush-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                {isFormValid && user ? (
                  <div className="items-center justify-center  flex flex-row flex-wrap gap-2">
                    <PaystackPayment
                      amount={retryOrder ? retryOrder.total_amount : total}
                      currency="GHS"
                      customerEmail={formData.email}
                      customerName={`${formData.firstName} ${formData.lastName}`}
                      onSuccess={handlePaystackSuccess}
                      onError={handlePaystackError}
                      className="w-full bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-3"
                      disabled={loading}
                      metadata={{
                        shipping_address: formData,
                        order_data: {
                          customer_id: user?.id,
                          customer_name: `${formData.firstName} ${formData.lastName}`,
                          customer_email: formData.email,
                          customer_phone: formData.phone,
                          total_amount: total,
                          subtotal: subtotal,
                          tax_amount: tax,
                          shipping_amount: shipping,
                          shipping_address: formData,
                          billing_address: formData,
                          payment_reference: "",
                          notes: formData.notes,
                          items: items,
                        },
                        items: retryOrder
                          ? retryOrder.order_items
                          : items.map((item) => ({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            selectedColor: item.selectedColor,
                            selectedLength: item.selectedLength,
                          })),
                        retry_order_id: retryOrder?.id,
                      }}
                    >
                      {loading
                        ? "Processing..."
                        : retryOrder
                          ? "Retry Payment"
                          : "Complete Order with Paystack"}
                    </PaystackPayment>
                    <div className="items-center">OR</div>
                    <PayOnDelevery
                      amount={retryOrder ? retryOrder.total_amount : total}
                      currency="GHS"
                      customerEmail={formData.email}
                      customerName={`${formData.firstName} ${formData.lastName}`}
                      onSuccess={handlePayLaterSuccess}
                      onError={handlePaystackError}
                      className="w-full bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-3"
                      disabled={loading}
                      metadata={{
                        shipping_address: formData,
                        order_data: {
                          customer_id: user?.id,
                          customer_name: `${formData.firstName} ${formData.lastName}`,
                          customer_email: formData.email,
                          customer_phone: formData.phone,
                          total_amount: total,
                          subtotal: subtotal,
                          tax_amount: tax,
                          shipping_amount: shipping,
                          shipping_address: formData,
                          billing_address: formData,
                          payment_reference: "",
                          notes: formData.notes,
                          items: items,
                        },
                        items: retryOrder
                          ? retryOrder.order_items
                          : items.map((item) => ({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            selectedColor: item.selectedColor,
                            selectedLength: item.selectedLength,
                          })),
                        retry_order_id: retryOrder?.id,
                      }}
                    >
                      {loading
                        ? "Processing..."
                        : retryOrder
                          ? "Retry Payment"
                          : "Pay on Delivery"}
                    </PayOnDelevery>
                  </div>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 font-semibold py-3"
                  >
                    {!user
                      ? "Please sign in to continue"
                      : "Please fill in all required fields"}
                  </Button>
                )}

                {!user && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/auth")}
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
