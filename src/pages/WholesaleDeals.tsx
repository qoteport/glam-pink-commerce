import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Users, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WholesaleDeal {
  id: string;
  name: string;
  description: string;
  min_quantity: number;
  discount_percentage: number;
  is_active: boolean;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    wholesale_price: number;
  }[];
}

const WholesaleDeals = () => {
  const [deals, setDeals] = useState<WholesaleDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWholesaleDeals();
  }, []);

  const fetchWholesaleDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('wholesale_deals')
        .select(`
          *,
          wholesale_deal_products!inner (
            wholesale_price,
            products!inner (
              id,
              name,
              price,
              image
            )
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      const transformedDeals = data?.map(deal => ({
        id: deal.id,
        name: deal.name,
        description: deal.description,
        min_quantity: deal.min_quantity,
        discount_percentage: deal.discount_percentage,
        is_active: deal.is_active,
        products: deal.wholesale_deal_products?.map(p => ({
          id: p.products.id,
          name: p.products.name,
          price: p.products.price,
          image: p.products.image,
          wholesale_price: p.wholesale_price
        })) || []
      })) || [];

      setDeals(transformedDeals);
    } catch (error) {
      console.error('Error fetching wholesale deals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wholesale deals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Wholesale Deals
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Bulk pricing for salons, retailers, and beauty professionals
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-pink-500" />
              Bulk Pricing
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-pink-500" />
              Professional Discounts
            </div>
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-pink-500" />
              Easy Ordering
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid gap-8">
          {deals.map((deal) => (
            <Card key={deal.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{deal.name}</CardTitle>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    {deal.discount_percentage}% OFF
                  </Badge>
                </div>
                <p className="text-gray-600">{deal.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white px-3 py-1 rounded-full text-pink-600 font-medium">
                    Min. {deal.min_quantity} pieces
                  </span>
                  <span className="text-gray-500">
                    {deal.products.length} products included
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deal.products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-pink-600">
                            ${product.wholesale_price}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>• Professional wholesale pricing</p>
                    <p>• Minimum order: {deal.min_quantity} pieces</p>
                    <p>• Contact us for custom quantities</p>
                  </div>
                  <Button variant="pink" size="lg">
                    Request Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need Custom Pricing?</h3>
              <p className="text-gray-600 mb-6">
                Contact our wholesale team for custom packages and bulk pricing options
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline">Call (555) 123-4567</Button>
                <Button variant="pink">Email Wholesale Team</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WholesaleDeals;