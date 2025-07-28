
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Users, ShoppingCart, Package, MessageSquare, FileText, Instagram, Crown, Percent, Truck, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import existing admin components
import Analytics from '@/components/admin/Analytics';
import ProductsManager from '@/components/admin/ProductsManager';
import OrdersManager from '@/components/admin/OrdersManager';
import UsersManager from '@/components/admin/UsersManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import InstagramManager from '@/components/admin/InstagramManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import HairTypesManager from '@/components/admin/HairTypesManager';
import TexturesManager from '@/components/admin/TexturesManager';
import DiscountsManager from '@/components/admin/DiscountsManager';
import WholesaleDealsManager from '@/components/admin/WholesaleDealsManager';
import ProductCollectionsManager from '@/components/admin/ProductCollectionsManager';
import CustomWigOrdersManager from '@/components/admin/CustomWigOrdersManager';
import HeroManager from '@/components/admin/HeroManager';
import SocialLinksManager from '@/components/admin/SocialLinksManager';
import SubscriptionsManager from '@/components/admin/SubscriptionsManager';

// Import new components
import ShippingRulesManager from '@/components/admin/ShippingRulesManager';
import TaxRulesManager from '@/components/admin/TaxRulesManager';

const Admin = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your store, products, and settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 lg:grid-cols-16">
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart size={16} />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package size={16} />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users size={16} />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <FileText size={16} />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>
              <TabsTrigger value="discounts" className="flex items-center space-x-2">
                <Percent size={16} />
                <span className="hidden sm:inline">Discounts</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center space-x-2">
                <Truck size={16} />
                <span className="hidden sm:inline">Shipping</span>
              </TabsTrigger>
              <TabsTrigger value="tax" className="flex items-center space-x-2">
                <Calculator size={16} />
                <span className="hidden sm:inline">Tax</span>
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex items-center space-x-2">
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center space-x-2">
                <Instagram size={16} />
                <span className="hidden sm:inline">Instagram</span>
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center space-x-2">
                <Crown size={16} />
                <span className="hidden sm:inline">Collections</span>
              </TabsTrigger>
              <TabsTrigger value="custom-wigs" className="flex items-center space-x-2">
                <Package size={16} />
                <span className="hidden sm:inline">Custom Wigs</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center space-x-2">
                <FileText size={16} />
                <span className="hidden sm:inline">Hero</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center space-x-2">
                <Instagram size={16} />
                <span className="hidden sm:inline">Social</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
                <Users size={16} />
                <span className="hidden sm:inline">Subscriptions</span>
              </TabsTrigger>
              <TabsTrigger value="wholesale" className="flex items-center space-x-2">
                <Package size={16} />
                <span className="hidden sm:inline">Wholesale</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <Analytics />
            </TabsContent>

            <TabsContent value="products">
              <ProductsManager />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersManager />
            </TabsContent>

            <TabsContent value="users">
              <UsersManager />
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-6">
                <CategoriesManager />
                <HairTypesManager />
                <TexturesManager />
              </div>
            </TabsContent>

            <TabsContent value="discounts">
              <DiscountsManager />
            </TabsContent>

            <TabsContent value="shipping">
              <ShippingRulesManager />
            </TabsContent>

            <TabsContent value="tax">
              <TaxRulesManager />
            </TabsContent>

            <TabsContent value="testimonials">
              <TestimonialsManager />
            </TabsContent>

            <TabsContent value="instagram">
              <InstagramManager />
            </TabsContent>

            <TabsContent value="collections">
              <ProductCollectionsManager />
            </TabsContent>

            <TabsContent value="custom-wigs">
              <CustomWigOrdersManager />
            </TabsContent>

            <TabsContent value="hero">
              <HeroManager />
            </TabsContent>

            <TabsContent value="social">
              <SocialLinksManager />
            </TabsContent>

            <TabsContent value="subscriptions">
              <SubscriptionsManager />
            </TabsContent>

            <TabsContent value="wholesale">
              <WholesaleDealsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
