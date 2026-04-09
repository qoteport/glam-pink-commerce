import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PriceDisplay from './PriceDisplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface CarouselProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  live_video_url?: string;
  is_new?: boolean;
  is_best_seller?: boolean;
  description?: string;
}

interface HeroData {
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
}

const Hero6 = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'Featured Products',
    subtitle: 'Explore our handpicked selection of premium hair products',
    cta_text: 'Shop All',
    cta_url: '/shop',
  });
  const [products, setProducts] = useState<CarouselProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      // First get the active hero6 settings
      const { data: heroSettings, error: heroError } = await supabase
        .from('hero_settings')
        .select('*')
        .eq('is_active', true)
        .eq('hero_design', 'hero6')
        .limit(1)
        .single();

      if (heroError && heroError.code !== 'PGRST116') throw heroError;

      if (heroSettings) {
        setHeroData({
          title: heroSettings.title,
          subtitle: heroSettings.subtitle,
          cta_text: heroSettings.cta_text,
          cta_url: heroSettings.cta_url,
        });

        // Fetch carousel products for this hero setting
        const { data: carouselProducts, error: productsError } = await supabase
          .from('hero_carousel_products')
          .select(`
            display_order,
            products (
              id,
              name,
              price,
              original_price,
              image,
              live_video_url,
              is_new,
              is_best_seller,
              description
            )
          `)
          .eq('hero_setting_id', heroSettings.id)
          .order('display_order', { ascending: true });

        if (productsError) throw productsError;

        if (carouselProducts) {
          const mappedProducts = carouselProducts
            .filter((cp: any) => cp.products)
            .map((cp: any) => cp.products as CarouselProduct);
          setProducts(mappedProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching hero6 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string, productName: string) => {
    navigate(`/product/${productSlug(productName, productId)}`);
  };

  const autoplayPlugin = Autoplay({ delay: 5000, stopOnInteraction: true });

  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-cream-50 via-blush-50 to-rosegold-50 min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-blush-600">Loading...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="relative bg-gradient-to-br from-cream-50 via-blush-50 to-rosegold-50 min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-blush-700">No Products Selected</h2>
          <p className="text-gray-600">Configure carousel products in the admin panel.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-blush-50 to-rosegold-50 min-h-[70vh] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">{heroData.title}</span>
          </h1>
          {heroData.subtitle && (
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {heroData.subtitle}
            </p>
          )}
        </div>

        {/* Product Carousel */}
        <div className="relative px-12">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[autoplayPlugin as any]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <div
                    className="group relative cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                      {/* Media Container */}
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {product.live_video_url ? (
                          <video
                            ref={(el) => (videoRefs.current[product.id] = el)}
                            src={product.live_video_url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                        ) : (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.is_new && (
                            <Badge className="bg-blush-500 text-white">New</Badge>
                          )}
                          {product.is_best_seller && (
                            <Badge className="bg-rosegold-500 text-white">Best Seller</Badge>
                          )}
                          {product.live_video_url && (
                            <Badge className="bg-black/50 text-white flex items-center gap-1">
                              <Play size={12} /> Video
                            </Badge>
                          )}
                        </div>

                        {/* Product Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-xl font-bold mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold">
                              <PriceDisplay
                                price={product.price}
                                designCSS="text-white"
                                className="py-0"
                              />
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-lg line-through opacity-70">
                                <PriceDisplay
                                  price={product.original_price}
                                  designCSS="text-white/70"
                                  className="py-0"
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick View Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                        <Button className="bg-white text-blush-600 hover:bg-blush-50">
                          View Product
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-6 bg-white/90 hover:bg-white border-blush-200" />
            <CarouselNext className="hidden md:flex -right-6 bg-white/90 hover:bg-white border-blush-200" />
          </Carousel>
        </div>

        {/* CTA Button */}
        {heroData.cta_text && (
          <div className="text-center mt-10">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate(heroData.cta_url || '/shop')}
            >
              {heroData.cta_text}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero6;
