
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Database, Lock, Mail, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-blush-50">
       <div className="mb-[100px]">
        <Header />
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-gray-600 mt-2">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blush-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Account preferences and settings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Pages visited and time spent on our website</li>
                  <li>Products viewed and purchased</li>
                  <li>Search queries and interactions with our site</li>
                  <li>Device information and browser type</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-rosegold-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your purchases and account</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send promotional emails and marketing communications (with your consent)</li>
                <li>Improve our website, products, and services</li>
                <li>Detect and prevent fraud or unauthorized activities</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-600" />
                Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">We may share your information with:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Service Providers:</strong> Payment processors, shipping companies, and other business partners</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                </ul>
              </div>
              
              <div className="bg-blush-50 p-4 rounded-lg">
                <p className="text-blush-800 font-medium">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing through trusted providers</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">You have the right to:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Access and review your personal information</li>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request data portability</li>
                  </ul>
                </div>
                
                <div className="bg-cream-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from.
              </p>
              <div className="space-y-2">
                <p className="text-gray-600"><strong>Essential Cookies:</strong> Required for the website to function properly</p>
                <p className="text-gray-600"><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</p>
                <p className="text-gray-600"><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</p>
              </div>
              <p className="text-gray-600 mt-4">
                You can control cookies through your browser settings, but disabling certain cookies may affect website functionality.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                If you have questions about this privacy policy or our data practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blush-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">privacy@hairytalesbeauty.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-rosegold-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+233 XX XXX XXXX</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
