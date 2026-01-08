
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PriceDisplay from '@/components/PriceDisplay';

const ShippingInfo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-blush-50">
       <div className="mb-[100px]">
        <Header />
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn about our shipping policies, delivery times, and costs for orders worldwide.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Shipping Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blush-500 pl-4">
                <h3 className="font-semibold text-lg">Standard Shipping</h3>
                <p className="text-gray-600">5-7 business days delivery</p>
                <p className="text-sm text-gray-500">Available for all locations</p>
              </div>
              <div className="border-l-4 border-rosegold-500 pl-4">
                <h3 className="font-semibold text-lg">Express Shipping</h3>
                <p className="text-gray-600">2-3 business days delivery</p>
                <p className="text-sm text-gray-500">Available in major cities</p>
              </div>
              <div className="border-l-4 border-gold-500 pl-4">
                <h3 className="font-semibold text-lg">Same Day Delivery</h3>
                <p className="text-gray-600">Within 24 hours</p>
                <p className="text-sm text-gray-500">Available in Accra and Kumasi</p>
              </div>
            </CardContent>
          </Card>

          {/* Processing Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Order Processing</h3>
                <p className="text-gray-600">All orders are processed within 1-2 business days.</p>
              </div>
              <div>
                <h3 className="font-semibold">Custom Wigs</h3>
                <p className="text-gray-600">Custom wig orders require 7-14 business days for creation before shipping.</p>
              </div>
              <div>
                <h3 className="font-semibold">Weekends & Holidays</h3>
                <p className="text-gray-600">Orders placed on weekends or holidays will be processed the next business day.</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Costs */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Shipping Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Location</th>
                      <th className="text-left py-2">Standard</th>
                      <th className="text-left py-2">Express</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2">Within Accra</td>
                      <td className="py-2">₵15</td>
                      <td className="py-2">₵25</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Greater Accra</td>
                      <td className="py-2">₵20</td>
                      <td className="py-2">₵35</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Other Regions</td>
                      <td className="py-2">₵25</td>
                      <td className="py-2">₵45</td>
                    </tr>
                    <tr>
                      <td className="py-2">International</td>
                      <td className="py-2">From $25</td>
                      <td className="py-2">From $45</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-blush-50 rounded-lg">
                <p className="text-sm text-blush-800">
                  <strong>Free Shipping:</strong> Orders over  <PriceDisplay
                        price={1000}
                        designCSS=""
                        className="py-0"
                      /> within Ghana qualify for free standard shipping!
                </p>
              </div>
            </CardContent>
          </Card> */}

          {/* International Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                International Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Available Countries</h3>
                <p className="text-gray-600">We ship to over 10+ countries worldwide including:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li>United States & Canada</li>
                  <li>United Kingdom & Europe</li>
                  <li>Australia & New Zealand</li>
                  <li>Europe</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Delivery Time</h3>
                <p className="text-gray-600">International orders typically take 7-21 business days depending on location.</p>
              </div>
              <div>
                <h3 className="font-semibold">Customs & Duties</h3>
                <p className="text-gray-600">International customers are responsible for any customs fees, duties, or taxes imposed by their country.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
            <CardDescription>
              Stay updated on your order status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blush-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-blush-600" />
                </div>
                <h3 className="font-semibold">Order Confirmed</h3>
                <p className="text-sm text-gray-600">You'll receive an order confirmation email with details</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-rosegold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-rosegold-600" />
                </div>
                <h3 className="font-semibold">Processing</h3>
                <p className="text-sm text-gray-600">Your order is being prepared for shipment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold">Shipped</h3>
                <p className="text-sm text-gray-600">Track your package with the provided tracking number</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ShippingInfo;
