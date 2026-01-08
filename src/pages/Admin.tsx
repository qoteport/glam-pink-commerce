import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Users,
  ShoppingCart,
  Package,
  MessageSquare,
  FileText,
  Instagram,
  Crown,
  Percent,
  Truck,
  Calculator,
  ExternalLink,
  LogOut,
  Star,
  UserCheck,
  FileQuestion,
  Gift,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import existing admin components
import Analytics from "@/components/admin/Analytics";
import ProductsManager from "@/components/admin/ProductsManager";
import OrdersManagerReal from "@/components/admin/OrdersManagerReal";
import UsersManager from "@/components/admin/UsersManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import InstagramManager from "@/components/admin/InstagramManager";
import CategoriesManager from "@/components/admin/CategoriesManager";
import HairTypesManager from "@/components/admin/HairTypesManager";
import TexturesManager from "@/components/admin/TexturesManager";
import DiscountsManager from "@/components/admin/DiscountsManager";
import WholesaleDealsManager from "@/components/admin/WholesaleDealsManager";
import ProductCollectionsManager from "@/components/admin/ProductCollectionsManager";
import CustomWigOrdersManager from "@/components/admin/CustomWigOrdersManager";
import HeroManager from "@/components/admin/HeroManager";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import SubscriptionsManager from "@/components/admin/SubscriptionsManager";
import ShippingRulesManager from "@/components/admin/ShippingRulesManager";
import TaxRulesManager from "@/components/admin/TaxRulesManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import CustomersManager from "@/components/admin/CustomersManager";
import QuotesManager from "@/components/admin/QuotesManager";
import AdminNotifications from "@/components/admin/AdminNotifications";
import OffersManager from "@/components/admin/OffersManager";

const Admin = () => {
  const { isAdmin, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleViewStore = () => {
    navigate("/");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  HairyTalesBeauty Admin
                </h1>
                <p className="text-gray-600">
                  Welcome back, {profile?.full_name || "Admin"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <AdminNotifications />
                <Button
                  variant="outline"
                  onClick={handleViewStore}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink size={16} />
                  <span>View Store</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-start w-full grid-cols-8 lg:grid-cols-16 mb-20">
              <TabsTrigger
                value="analytics"
                className="flex items-center space-x-2"
              >
                <BarChart size={16} />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="flex items-center space-x-2"
              >
                <Package size={16} />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="custom-wigs"
                className="flex items-center space-x-2"
              >
                <Package size={16} />
                <span className="hidden sm:inline">Custom Wigs</span>
              </TabsTrigger>
              <TabsTrigger
                value="quotes"
                className="flex items-center space-x-2"
              >
                <FileQuestion size={16} />
                <span className="hidden sm:inline">Quotes</span>
              </TabsTrigger>
              <TabsTrigger
                value="wholesale"
                className="flex items-center space-x-2"
              >
                <Package size={16} />
                <span className="hidden sm:inline">Wholesale</span>
              </TabsTrigger>
              <TabsTrigger
                value="offers"
                className="flex items-center space-x-2"
              >
                <Gift size={16} />
                <span className="hidden sm:inline">Offers</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center space-x-2"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="flex items-center space-x-2"
              >
                <UserCheck size={16} />
                <span className="hidden sm:inline">Customers</span>
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center space-x-2"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>

              <TabsTrigger
                value="collections"
                className="flex items-center space-x-2"
              >
                <Crown size={16} />
                <span className="hidden sm:inline">Collections</span>
              </TabsTrigger>

              <TabsTrigger
                value="discounts"
                className="flex items-center space-x-2"
              >
                <Percent size={16} />
                <span className="hidden sm:inline">Discounts</span>
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="flex items-center space-x-2"
              >
                <Truck size={16} />
                <span className="hidden sm:inline">Shipping</span>
              </TabsTrigger>
              <TabsTrigger value="tax" className="flex items-center space-x-2">
                <Calculator size={16} />
                <span className="hidden sm:inline">Tax</span>
              </TabsTrigger>
                  <TabsTrigger
                value="reviews"
                className="flex items-center space-x-2"
              >
                <Star size={16} />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger
                value="testimonials"
                className="flex items-center space-x-2"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center space-x-2">
                <FileText size={16} />
                <span className="hidden sm:inline">Hero</span>
              </TabsTrigger>
              <TabsTrigger
                value="instagram"
                className="flex items-center space-x-2"
              >
                <Instagram size={16} />
                <span className="hidden sm:inline">Instagram</span>
              </TabsTrigger>



              <TabsTrigger
                value="social"
                className="flex items-center space-x-2"
              >
                <Instagram size={16} />
                <span className="hidden sm:inline">Social Handles</span>
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="flex items-center space-x-2"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Subscriptions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="mx-2">
              <Analytics />
            </TabsContent>

            <TabsContent value="products" className="mx-2">
              <ProductsManager />
            </TabsContent>

            <TabsContent value="orders" className="mx-2">
              <OrdersManagerReal />
            </TabsContent>

            <TabsContent value="users" className="mx-2">
              <UsersManager />
            </TabsContent>

            <TabsContent value="customers" className="mx-2">
              <CustomersManager />
            </TabsContent>

            <TabsContent value="categories" className="mx-2">
              <div className="space-y-6">
                <CategoriesManager />
                <HairTypesManager />
                <TexturesManager />
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mx-2">
              <ReviewsManager />
            </TabsContent>

            <TabsContent value="discounts" className="mx-2">
              <DiscountsManager />
            </TabsContent>

            <TabsContent value="shipping" className="mx-2">
              <ShippingRulesManager />
            </TabsContent>

            <TabsContent value="tax" className="mx-2">
              <TaxRulesManager />
            </TabsContent>

            <TabsContent value="testimonials" className="mx-2">
              <TestimonialsManager />
            </TabsContent>

            <TabsContent value="instagram" className="mx-2">
              <InstagramManager />
            </TabsContent>

            <TabsContent value="collections" className="mx-2">
              <ProductCollectionsManager />
            </TabsContent>

            <TabsContent value="custom-wigs" className="mx-2">
              <CustomWigOrdersManager />
            </TabsContent>

            <TabsContent value="hero" className="mx-2">
              <HeroManager />
            </TabsContent>

            <TabsContent value="social" className="mx-2">
              <SocialLinksManager />
            </TabsContent>

            <TabsContent value="subscriptions" className="mx-2">
              <SubscriptionsManager />
            </TabsContent>

            <TabsContent value="wholesale" className="mx-2">
              <WholesaleDealsManager />
            </TabsContent>

            <TabsContent value="quotes" className="mx-2">
              <QuotesManager />
            </TabsContent>

            <TabsContent value="offers" className="mx-2">
              <OffersManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
