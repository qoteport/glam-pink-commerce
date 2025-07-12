import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface HeroData {
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  background_image?: string;
  featured_product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

const Hero2 = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'Premium Hair Collection',
    subtitle: 'Transform your look with our luxury collection of premium wigs and hair extensions designed for the modern woman.',
    cta_text: 'Explore Collection',
    cta_url: '/shop'
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select(`
          *,
          products!featured_product_id (id, name, price, image)
        `)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setHeroData({
          title: data.title,
          subtitle: data.subtitle,
          cta_text: data.cta_text,
          cta_url: data.cta_url,
          background_image: data.background_image,
          featured_product: data.products,
        });
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        {heroData.background_image ? (
          <img 
            src={heroData.background_image} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
        {/* Trust Badge */}
        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
          ✨ Trusted by 25,000+ Women Worldwide
        </Badge>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            {heroData.title.split(' ').slice(0, 2).join(' ')}
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {heroData.title.split(' ').slice(2).join(' ')}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {heroData.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-white">
          <div className="text-center">
            <div className="text-3xl font-bold">50K+</div>
            <div className="text-sm text-gray-400">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-bold">4.9</span>
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
            </div>
            <div className="text-sm text-gray-400">Customer Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-sm text-gray-400">Premium Styles</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold"
            onClick={() => navigate(heroData.cta_url || '/shop')}
          >
            <ShoppingBag className="mr-2" size={20} />
            {heroData.cta_text || 'Shop Now'}
            <ArrowRight className="ml-2" size={20} />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
          >
            <Play className="mr-2" size={20} />
            Watch Story
          </Button>
        </div>

        {/* Featured Product Card */}
        {heroData.featured_product && (
          <div className="max-w-sm mx-auto mt-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="aspect-square bg-white/5 rounded-xl mb-4 overflow-hidden">
                <img 
                  src={heroData.featured_product.image} 
                  alt={heroData.featured_product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white font-semibold mb-2">{heroData.featured_product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">${heroData.featured_product.price}</span>
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <div className="text-sm mb-2">Scroll to explore</div>
        <div className="w-0.5 h-8 bg-white/30 mx-auto"></div>
      </div>
    </section>
  );
};

export default Hero2;