import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Users, ShoppingCart, ArrowRight, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QuoteRequestForm from '@/components/QuoteRequestForm';

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
  const [selectedDeal, setSelectedDeal] = useState<WholesaleDeal | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
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
          wholesale_deal_products (
            wholesale_price,
            products (
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
        description: deal.description || '',
        min_quantity: deal.min_quantity,
        discount_percentage: deal.discount_percentage,
        is_active: deal.is_active,
        products: deal.wholesale_deal_products?.map((p: any) => ({
          id: p.products?.id || '',
          name: p.products?.name || '',
          price: p.products?.price || 0,
          image: p.products?.image || '',
          wholesale_price: p.wholesale_price
        })).filter((p: any) => p.id) || []
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

  const calculateSavings = (regularPrice: number, wholesalePrice: number) => {
    return ((regularPrice - wholesalePrice) / regularPrice * 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-[70px]">
          <Header />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-[70px]">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Wholesale Deals
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Bulk pricing for salons, retailers, and beauty professionals
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary" />
              Bulk Pricing
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Professional Discounts
            </div>
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
              Easy Ordering
            </div>
          </div>
        </div>

        {/* No Deals Message */}
        {deals.length === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Wholesale Deals Available</h3>
              <p className="text-muted-foreground mb-6">
                Check back soon for exclusive wholesale pricing and bulk deals.
              </p>
              <Button variant="outline" onClick={() => setShowQuoteForm(true)}>
                Request a Custom Quote
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl md:text-2xl">{deal.name}</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">
                    {deal.discount_percentage}% OFF
                  </Badge>
                </div>
                {deal.description && (
                  <p className="text-muted-foreground">{deal.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-background px-3 py-1 rounded-full text-primary font-medium">
                    Min. {deal.min_quantity} pieces
                  </span>
                  <span className="text-muted-foreground">
                    {deal.products.length} products included
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Product Preview (show first 3) */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {deal.products.slice(0, 2).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{product.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-primary">
                            ₵{product.wholesale_price}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            ₵{product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {deal.products.length > 2 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    +{deal.products.length - 3} more products in this deal
                  </p>
                )}

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>• Professional wholesale pricing</p>
                    <p>• Minimum order: {deal.min_quantity} pieces</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button onClick={() => {
                      setSelectedDeal(null);
                      setShowQuoteForm(true);
                      document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Request Quote
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quote Request Form Section */}
        <div className="mt-16" id="quote-form">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-3xl font-bold mb-4">Request a Quote</h2>
            <p className="text-muted-foreground">
              Fill out the form below or contact us directly for wholesale pricing
            </p>
          </div>
          <QuoteRequestForm />
        </div>
      </div>

      {/* Deal Details Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-3xl w-full h-screen md:h-auto md:max-h-[95vh] overflow-y-hidden flex flex-col p-0">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3 px-6 py-4 border-b text-start">
              <span>{selectedDeal?.name}</span>
              <Badge className="bg-primary text-primary-foreground">
                {selectedDeal?.discount_percentage}% OFF
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedDeal && (
            <div className="space-y-4 mt-4 px-6 pb-24 md:pb-6 overflow-y-auto no-scrollbar">
              {selectedDeal.description && (
                <p className="text-muted-foreground">{selectedDeal.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">
                  Min. {selectedDeal.min_quantity} pieces
                </Badge>
                <Badge variant="outline">
                  {selectedDeal.products.length} products
                </Badge>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Products in this Deal</h4>
                <div className="grid gap-4">
                  {selectedDeal.products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">{product.name}</h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-lg font-bold text-primary">
                            ₵{product.wholesale_price}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ₵{product.price}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Save {calculateSavings(product.price, product.wholesale_price)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />


            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 md:static border-t bg-background p-4 md:p-6">
            <div className="flex justify-end gap-3 pt-4">

              <Button variant="outline" onClick={() => setSelectedDeal(null)}>
                Close
              </Button>
              <Button onClick={() => {
                setSelectedDeal(null);
                setShowQuoteForm(true);
                document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Request Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default WholesaleDeals;
