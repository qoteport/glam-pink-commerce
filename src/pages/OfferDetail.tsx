import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface OfferProduct {
  id: string;
  product_id: string;
  offer_price: number | null;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string | null;
    colors: string[] | null;
    lengths: string[] | null;
  };
}

interface Offer {
  id: string;
  name: string;
  description: string | null;
  banner_image: string | null;
  discount_percentage: number;
  start_date: string;
  end_date: string;
}

const OfferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerProducts, setOfferProducts] = useState<OfferProduct[]>([]);
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
  const [selectedColors, setSelectedColors] = useState<Map<string, string>>(new Map());
  const [selectedLengths, setSelectedLengths] = useState<Map<string, string>>(new Map());
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOfferDetails();
  }, [id]);

  useEffect(() => {
    if (!offer) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(offer.end_date).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offer]);

  const fetchOfferDetails = async () => {
    try {
      const { data: offerData, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', id)
        .single();

      if (offerError) throw offerError;
      setOffer(offerData);

      const { data: productsData, error: productsError } = await supabase
        .from('offer_products')
        .select('*, product:products(*)')
        .eq('offer_id', id);

      if (productsError) throw productsError;
      setOfferProducts(productsData || []);

      // Initialize quantities
      const qtyMap = new Map<string, number>();
      productsData?.forEach((p) => qtyMap.set(p.product_id, 1));
      setQuantities(qtyMap);
    } catch (error) {
      console.error('Error fetching offer:', error);
      toast({ title: 'Error', description: 'Failed to load offer', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newMap = new Map(quantities);
    const current = newMap.get(productId) || 1;
    const newQty = Math.max(1, current + delta);
    newMap.set(productId, newQty);
    setQuantities(newMap);
  };

  const handleAddToCart = (offerProduct: OfferProduct) => {
    const quantity = quantities.get(offerProduct.product_id) || 1;
    const price = offerProduct.offer_price || offerProduct.product.price;
    
    addToCart(
      {
        id: offerProduct.product_id,
        name: offerProduct.product.name,
        price: price,
        image: offerProduct.product.image,
      },
      quantity,
      selectedColors.get(offerProduct.product_id),
      selectedLengths.get(offerProduct.product_id)
    );

    toast({
      title: 'Added to cart!',
      description: `${quantity}x ${offerProduct.product.name} added to your cart`,
    });
  };

  const handleAddAllToCart = () => {
    offerProducts.forEach((op) => handleAddToCart(op));
    toast({
      title: 'All items added!',
      description: 'All offer products have been added to your cart',
    });
  };

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-rosegold-500 rounded-lg px-3 py-2 min-w-[50px]">
        <span className="text-xl md:text-2xl font-bold text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-gray-600 mt-1">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rosegold-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Offer Not Found</h1>
          <p className="text-gray-600 mb-6">This offer may have expired or doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isExpired = new Date() > new Date(offer.end_date);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-[100px]">
        <Header />
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Offer Header */}
        <div 
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            backgroundImage: offer.banner_image ? `url(${offer.banner_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '200px',
          }}
        >
          <div className={`${offer.banner_image ? 'bg-black/50' : 'bg-gradient-to-r from-rosegold-500 to-blush-500'} p-8`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <Badge className="bg-orange-500 text-white border-none mb-3">
                  {isExpired ? 'Expired' : 'Limited Time Offer'}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{offer.name}</h1>
                {offer.description && (
                  <p className="text-white/90 max-w-xl">{offer.description}</p>
                )}
                <Badge className="bg-white/20 text-white border-white/30 mt-4 text-xl px-6 py-2">
                  {offer.discount_percentage}% OFF
                </Badge>
              </div>

              {!isExpired && (
                <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Offer ends in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TimeBlock value={timeLeft.days} label="Days" />
                    <span className="text-xl text-white font-bold">:</span>
                    <TimeBlock value={timeLeft.hours} label="Hours" />
                    <span className="text-xl text-white font-bold">:</span>
                    <TimeBlock value={timeLeft.minutes} label="Mins" />
                    <span className="text-xl text-white font-bold">:</span>
                    <TimeBlock value={timeLeft.seconds} label="Secs" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-600 font-medium">This offer has expired. Check out our latest deals!</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Products in this Offer ({offerProducts.length})
          </h2>
          {!isExpired && offerProducts.length > 0 && (
            <Button onClick={handleAddAllToCart} className="bg-rosegold-500 hover:bg-rosegold-600">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offerProducts.map((op) => {
            const originalPrice = op.product.price;
            const offerPrice = op.offer_price || originalPrice;
            const savings = originalPrice - offerPrice;
            const quantity = quantities.get(op.product_id) || 1;

            return (
              <Card key={op.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={op.product.image}
                    alt={op.product.name}
                    className="w-full h-48 object-cover"
                  />
                  {savings > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      Save ₵{savings.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{op.product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{op.product.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-rosegold-600">
                      ₵{offerPrice.toFixed(2)}
                    </span>
                    {savings > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        ₵{originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Color Selection */}
                  {op.product.colors && op.product.colors.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {op.product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              const newMap = new Map(selectedColors);
                              newMap.set(op.product_id, color);
                              setSelectedColors(newMap);
                            }}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              selectedColors.get(op.product_id) === color
                                ? 'bg-rosegold-500 text-white border-rosegold-500'
                                : 'border-gray-300 hover:border-rosegold-300'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Length Selection */}
                  {op.product.lengths && op.product.lengths.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Length</label>
                      <div className="flex flex-wrap gap-2">
                        {op.product.lengths.map((length) => (
                          <button
                            key={length}
                            onClick={() => {
                              const newMap = new Map(selectedLengths);
                              newMap.set(op.product_id, length);
                              setSelectedLengths(newMap);
                            }}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              selectedLengths.get(op.product_id) === length
                                ? 'bg-rosegold-500 text-white border-rosegold-500'
                                : 'border-gray-300 hover:border-rosegold-300'
                            }`}
                          >
                            {length}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quantity</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(op.product_id, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(op.product_id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="font-bold text-lg">₵{(offerPrice * quantity).toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(op)}
                      disabled={isExpired}
                      className="w-full bg-rosegold-500 hover:bg-rosegold-600"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfferDetail;
