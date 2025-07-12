
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Crown } from 'lucide-react';
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

const Hero4 = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'Elegant Beauty Collection',
    subtitle: 'Discover our premium selection of handcrafted wigs and hair extensions.',
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
        .eq('hero_design', 'hero4')
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
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {heroData.background_image ? (
          <img 
            src={heroData.background_image} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 via-pink-50 to-white flex items-center justify-center">
            <div className="text-center space-y-4 opacity-30">
              <Crown size={120} className="text-pink-400 mx-auto" />
              <p className="text-2xl font-semibold text-pink-600">Upload your hero image</p>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            {/* Badge */}
            <Badge className="bg-white/90 text-pink-600 border-0 mb-6 text-lg px-4 py-2">
              ✨ Premium Quality
            </Badge>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              {heroData.title.split(' ').slice(0, 2).join(' ')}
              <span className="block bg-gradient-to-r from-pink-400 to-pink-200 bg-clip-text text-transparent">
                {heroData.title.split(' ').slice(2).join(' ')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-lg">
              {heroData.subtitle}
            </p>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300"
              onClick={() => navigate(heroData.cta_url || '/shop')}
            >
              {heroData.cta_text || 'Shop Now'}
              <ArrowRight className="ml-3" size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
            <Crown size={28} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Premium Collection</h3>
            <p className="text-sm text-gray-600">Handcrafted with Love</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero4;
