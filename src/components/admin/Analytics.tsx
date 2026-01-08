
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    avgOrderValue: 0,
    salesData: [],
    categoryData: [],
    topProducts: [],
    ordersByStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `);

      if (ordersError) throw ordersError;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Fetch users data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Process analytics data
      const processedAnalytics = processAnalyticsData(orders || [], products || [], profiles || []);
      setAnalytics(processedAnalytics);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (orders: any[], products: any[], profiles: any[]) => {
    // Calculate total revenue and orders
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });

    // Calculate new customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = profiles.filter(profile => 
      new Date(profile.created_at) >= thirtyDaysAgo
    ).length;

    // Generate sales data by month (last 6 months)
    const salesData = generateMonthlySalesData(orders);

    // Generate category data
    const categoryData = generateCategoryData(orders, products);

    // Generate top products
    const topProducts = generateTopProducts(orders);

    return {
      totalRevenue,
      totalOrders,
      newCustomers,
      avgOrderValue,
      salesData,
      categoryData,
      topProducts,
      ordersByStatus
    };
  };

  const generateMonthlySalesData = (orders: any[]) => {
    const monthlyData = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData.set(monthKey, { month: months[date.getMonth()], revenue: 0, orders: 0 });
    }

    // Process orders
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const monthKey = `${months[orderDate.getMonth()]} ${orderDate.getFullYear()}`;
      
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey);
        data.revenue += parseFloat(order.total_amount || 0);
        data.orders += 1;
      }
    });

    return Array.from(monthlyData.values());
  };

  const generateCategoryData = (orders: any[], products: any[]) => {
    const categoryCount = new Map();
    
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const category = product.category || 'Other';
          categoryCount.set(category, (categoryCount.get(category) || 0) + item.quantity);
        }
      });
    });

    const colors = ['#D97706', '#059669', '#7C3AED', '#DC2626', '#0EA5E9'];
    let colorIndex = 0;

    return Array.from(categoryCount.entries()).map(([name, value]) => ({
      name,
      value,
      color: colors[colorIndex++ % colors.length]
    }));
  };

  const generateTopProducts = (orders: any[]) => {
    const productStats = new Map();
    
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const key = item.product_id;
        if (!productStats.has(key)) {
          productStats.set(key, {
            name: item.product_name,
            sales: 0,
            revenue: 0
          });
        }
        
        const stats = productStats.get(key);
        stats.sales += item.quantity;
        stats.revenue += parseFloat(item.total_price || 0);
      });
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">₵{analytics.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Live data
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Package className="w-4 h-4 mr-1" />
                  Live data
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{analytics.newCustomers}</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  Last 30 days
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">₵{analytics.avgOrderValue.toFixed(2)}</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Live data
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and order count (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="revenue" fill="#D97706" name="Revenue (₵)" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Product category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Best selling products by revenue and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₵{product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sales data available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
