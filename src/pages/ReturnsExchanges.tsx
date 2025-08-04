
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Calendar, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ReturnsExchanges = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-blush-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Exchanges</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We want you to love your purchase! Learn about our return and exchange policies to ensure you're completely satisfied.
          </p>
        </div>

        {/* Return Policy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Return Policy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blush-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blush-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">30-Day Returns</h3>
                <p className="text-gray-600">Return unused items within 30 days of delivery for a full refund</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rosegold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-rosegold-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Free Returns</h3>
                <p className="text-gray-600">We provide free return shipping labels for easy returns</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Exchanges</h3>
                <p className="text-gray-600">Exchange for different size, color, or style hassle-free</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Return Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Return Conditions</CardTitle>
              <CardDescription>Items must meet these requirements for returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blush-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Unused Condition</h4>
                  <p className="text-gray-600">Items must be in original, unused condition with all tags attached</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blush-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Original Packaging</h4>
                  <p className="text-gray-600">Items must be returned in original packaging when applicable</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blush-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Within 30 Days</h4>
                  <p className="text-gray-600">Returns must be initiated within 30 days of delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blush-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Proof of Purchase</h4>
                  <p className="text-gray-600">Original receipt or order confirmation required</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Return */}
          <Card>
            <CardHeader>
              <CardTitle>How to Return</CardTitle>
              <CardDescription>Follow these simple steps to return your item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blush-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blush-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Contact Us</h4>
                  <p className="text-gray-600">Email us at returns@hairytalesbeauty.com with your order number</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rosegold-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-rosegold-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Receive Return Label</h4>
                  <p className="text-gray-600">We'll send you a prepaid return shipping label</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Ship Your Item</h4>
                  <p className="text-gray-600">Package securely and ship using the provided label</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-cream-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cream-800 font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">Get Your Refund</h4>
                  <p className="text-gray-600">Refund processed within 5-7 business days after we receive your return</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Policy</CardTitle>
              <CardDescription>Need a different size or color? We've got you covered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Free Exchanges</h4>
                <p className="text-gray-600">Exchange for different size, color, or length at no extra cost</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Exchange Process</h4>
                <p className="text-gray-600">Contact us to arrange an exchange - we'll send the new item once we receive your return</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Processing Time</h4>
                <p className="text-gray-600">Exchanges typically take 7-10 business days to complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Non-Returnable Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Non-Returnable Items
              </CardTitle>
              <CardDescription>These items cannot be returned for hygiene reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mt-2"></span>
                  <span className="text-gray-600">Custom-made wigs and hairpieces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mt-2"></span>
                  <span className="text-gray-600">Items that have been worn or used</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mt-2"></span>
                  <span className="text-gray-600">Hair care products that have been opened</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mt-2"></span>
                  <span className="text-gray-600">Sale items marked as final sale</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact for Returns */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help with Returns?</CardTitle>
            <CardDescription>
              Our customer service team is here to help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">
                  Have questions about returns or need assistance? Contact our friendly support team.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Email: returns@hairytalesbeauty.com</p>
                  <p>Phone: +233 123 456 789</p>
                  <p>Hours: Monday - Friday, 9AM - 6PM GMT</p>
                </div>
              </div>
              <Button>Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ReturnsExchanges;
