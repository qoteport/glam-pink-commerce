
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShoppingCart, CreditCard, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-blush-50">
       <div className="mb-[100px]">
        <Header />
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-gray-600 mt-2">
            Please read these terms carefully before using our services.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blush-600" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By accessing and using HairyTales Beauty website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card>
            <CardHeader>
              <CardTitle>Use License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Permission is granted to:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Browse and purchase products for personal use</li>
                  <li>Create an account and manage your profile</li>
                  <li>Access customer support services</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">This license shall not allow you to:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or other proprietary notations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-rosegold-600" />
                Product Information and Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>We strive to display product colors and images as accurately as possible, but cannot guarantee that your display will accurately reflect the actual product colors</li>
                <li>All products are subject to availability and we reserve the right to discontinue any product at any time</li>
                <li>We reserve the right to limit quantities of any products or services we offer</li>
                <li>Product descriptions, pricing, and availability are subject to change without notice</li>
              </ul>
            </CardContent>
          </Card>

          {/* Ordering and Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-600" />
                Ordering and Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Order Acceptance</h3>
                <p className="text-gray-600">
                  We reserve the right to refuse or cancel any order at any time for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Payment Terms</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Payment is required at the time of purchase</li>
                  <li>We accept major credit cards and other payment methods as displayed</li>
                  <li>All prices are in Ghana Cedis (GHS) unless otherwise stated</li>
                  <li>Prices include applicable taxes where required</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Shipping and Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                Shipping and Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss and title for products pass to you upon delivery to the carrier</li>
                <li>We are not responsible for delays caused by shipping carriers</li>
                <li>Additional customs fees or duties for international orders are the customer's responsibility</li>
                <li>Shipping costs are non-refundable unless the return is due to our error</li>
              </ul>
            </CardContent>
          </Card>

          {/* Returns and Refunds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                Returns and Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Return Policy</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Items must be returned within 30 days of purchase</li>
                  <li>Products must be unused, unworn, and in original packaging</li>
                  <li>Custom or personalized items cannot be returned</li>
                  <li>Sale items may not be eligible for return</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Refund Process</h3>
                <p className="text-gray-600">
                  Refunds will be processed to the original payment method within 5-10 business days after we receive and inspect the returned item.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Account Responsibility</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must notify us immediately of any unauthorized use of your account</li>
                    <li>You must provide accurate and complete information when creating an account</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Account Termination</h3>
                  <p className="text-gray-600">
                    We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason we deem appropriate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Prohibited Uses
              </CardTitle>
              <CardDescription>
                You may not use our service for any unlawful or prohibited activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Violating any applicable laws or regulations</li>
                <li>Transmitting malicious code or viruses</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Engaging in any form of harassment or abuse</li>
                <li>Using our service for fraudulent purposes</li>
                <li>Interfering with the proper functioning of our website</li>
                <li>Copying, reproducing, or distributing our content without permission</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                In no event shall HairyTales Beauty or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
              <p className="text-gray-600">
                Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                These terms and conditions are governed by and construed in accordance with the laws of Ghana and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We reserve the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service. We will notify users of material changes by posting updates on this page.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Questions about the Terms of Service should be sent to us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-600"><strong>Email:</strong> legal@hairytalesbeauty.com</p>
                <p className="text-gray-600"><strong>Phone:</strong> +233 XX XXX XXXX</p>
                <p className="text-gray-600"><strong>Address:</strong> Accra, Ghana</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
