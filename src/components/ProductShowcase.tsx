
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from './ProductCard';
import { ChevronRight, Sparkles, Crown, Star } from 'lucide-react';
import { Product } from '@/data/products';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProductCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  item_count: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

const ProductShowcase = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .limit(8)
          .order('updated_at', { ascending: false });
        
        if (productsData) {
          const transformedProducts = productsData.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.original_price || undefined,
            rating: product.rating || 0,
            reviewCount: product.review_count || 0,
            image: product.image,
            category: product.category as 'wigs' | 'bundles' | 'closures' | 'frontals',
            subcategory: product.subcategory || undefined,
            isNew: product.is_new || false,
            isBestSeller: product.is_best_seller || false,
            colors: product.colors || [],
            lengths: product.lengths || [],
            size: product.size || [],
            description: product.description || undefined,
            features: product.features || [],
            hairType: product.hair_type || undefined,
            texture: product.texture || undefined,
            imageGallery: product.image_gallery || [],
            hairCareInstructions: product.hair_care_instructions || undefined,
            type: product.type || undefined,
            liveVideoUrl: product.live_video_url || undefined,
          }));
          setFeaturedProducts(transformedProducts);
        }

        // Fetch collections
        const { data: collectionsData } = await supabase
          .from('product_collections')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (collectionsData) {
          setCollections(collectionsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return Crown;
      case 'Sparkles':
        return Sparkles;
      case 'Star':
        return Star;
      default:
        return Crown;
    }
  };

  return (
    <section className="py-16 bg-white" id="shop">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge className="bg-blush-100 text-blush-600 border-blush-200 px-4 py-2">
            ✨ Featured Collections
          </Badge>
          <h2 className="text-xl md:text-3xl md:text-4xl font-bold text-gray-800">
            Shop Our <span className="text-gradient">Premium Collection</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of high-quality wigs and hair bundles, 
            trusted by thousands of satisfied customers worldwide.
          </p>
        </div>

        {/* Collection Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {collections.map((collection) => {
            const IconComponent = getIconComponent(collection.icon);
            return (
              <div
                key={collection.id}
                className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br text-white cursor-pointer hover-lift"
                onClick={() => navigate(`/shop?category=${collection.category}`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-90`}></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <IconComponent size={32} className="text-white" />
                    <Badge className="bg-white/20 text-white border-white/30">
                      {collection.item_count}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
                    <p className="text-white/90 text-sm">{collection.description}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Explore Collection
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Products */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Best Sellers & New Arrivals
              </h3>
              <p className="text-gray-600">
                Our most popular pieces, loved by customers worldwide
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:flex border-blush-300 text-blush-600 hover:bg-blush-50"
              onClick={() => navigate('/shop')}
            >
              View All Products
              <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>

          {/* Product Grid - Now showing 8 products */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="md:hidden text-center">
            <Button
              variant="outline"
              className="border-blush-300 text-blush-600 hover:bg-blush-50"
              onClick={() => navigate('/shop')}
            >
              View All Products
              <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        {/* <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-blush-100">
          {[
            { stat: '10K+', label: 'Happy Customers', icon: '💕' },
            { stat: '4.9/5', label: 'Customer Rating', icon: '⭐' },
            { stat: '100%', label: 'Virgin Hair', icon: '💎' },
            { stat: '24/7', label: 'Support Team', icon: '🔧' }
          ].map((item, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-xl md:text-2xl">{item.icon}</div>
              <div className="text-xl md:text-2xl font-bold text-blush-600">{item.stat}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default ProductShowcase;
