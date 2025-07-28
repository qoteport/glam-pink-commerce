
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Crown,
  Plus,
  Tags,
  Receipt,
  MessageSquare,
  Grid3x3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProductsManager from '@/components/admin/ProductsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import TexturesManager from '@/components/admin/TexturesManager';
import HairTypesManager from '@/components/admin/HairTypesManager';
import DiscountsManager from '@/components/admin/DiscountsManager';
import UsersManager from '@/components/admin/UsersManager';
import OrdersManagerReal from '@/components/admin/OrdersManagerReal';
import HeroManager from '@/components/admin/HeroManager';
import SocialLinksManager from '@/components/admin/SocialLinksManager';
import InstagramManager from '@/components/admin/InstagramManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import WholesaleDealsManager from '@/components/admin/WholesaleDealsManager';
import CustomWigOrdersManager from '@/components/admin/CustomWigOrdersManager';
import ProductCollectionsManager from '@/components/admin/ProductCollectionsManager';
import Analytics from '@/components/admin/Analytics';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: '156',
      change: '+12%',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+23%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Orders Today',
      value: '47',
      change: '+8%',
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue',
      value: '$12,430',
      change: '+15%',
      icon: BarChart3,
      color: 'text-rosegold-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-rosegold-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HairyTalesBeauty Admin</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-blush-200 text-blush-600 hover:bg-blush-50"
              >
                View Store
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Management Console</CardTitle>
            <CardDescription>Manage your store's products, users, and orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto mb-6">
                <TabsList className="flex w-max space-x-1 p-1">
                  <TabsTrigger value="products" className="flex items-center space-x-2">
                    <Package size={16} />
                    <span>Products</span>
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="flex items-center space-x-2">
                    <Tags size={16} />
                    <span>Categories</span>
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="flex items-center space-x-2">
                    <Grid3x3 size={16} />
                    <span>Collections</span>
                  </TabsTrigger>
                  <TabsTrigger value="discounts" className="flex items-center space-x-2">
                    <Receipt size={16} />
                    <span>Discounts</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Users</span>
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex items-center space-x-2">
                    <ShoppingCart size={16} />
                    <span>Orders</span>
                  </TabsTrigger>
                  <TabsTrigger value="hero" className="flex items-center space-x-2">
                    <Crown size={16} />
                    <span>Hero</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Social</span>
                  </TabsTrigger>
                  <TabsTrigger value="testimonials" className="flex items-center space-x-2">
                    <MessageSquare size={16} />
                    <span>Testimonials</span>
                  </TabsTrigger>
                  <TabsTrigger value="wholesale" className="flex items-center space-x-2">
                    <BarChart3 size={16} />
                    <span>Wholesale</span>
                  </TabsTrigger>
                  <TabsTrigger value="custom-orders" className="flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Custom Orders</span>
                  </TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="products" className="space-y-4">
                <ProductsManager />
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <Tabs defaultValue="categories" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="textures">Textures</TabsTrigger>
                    <TabsTrigger value="hairtypes">Hair Types</TabsTrigger>
                  </TabsList>
                  <TabsContent value="categories" className="space-y-4">
                    <CategoriesManager />
                  </TabsContent>
                  <TabsContent value="textures" className="space-y-4">
                    <TexturesManager />
                  </TabsContent>
                  <TabsContent value="hairtypes" className="space-y-4">
                    <HairTypesManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="collections" className="space-y-4">
                <ProductCollectionsManager />
              </TabsContent>

              <TabsContent value="discounts" className="space-y-4">
                <DiscountsManager />
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <UsersManager />
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <OrdersManagerReal />
              </TabsContent>

              <TabsContent value="hero" className="space-y-4">
                <HeroManager />
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <SocialLinksManager />
              </TabsContent>

              <TabsContent value="testimonials" className="space-y-4">
                <TestimonialsManager />
              </TabsContent>

              <TabsContent value="wholesale" className="space-y-4">
                <WholesaleDealsManager />
              </TabsContent>

              <TabsContent value="custom-orders" className="space-y-4">
                <CustomWigOrdersManager />
              </TabsContent>

              <TabsContent value="instagram" className="space-y-4">
                <InstagramManager />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Analytics />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
