import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, ShoppingCart, Users, Award } from 'lucide-react';
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

const Hero3 = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'Beauty That Inspires',
    subtitle: 'Discover handcrafted wigs and extensions that celebrate your unique style and empower your confidence every day.',
    cta_text: 'Start Your Journey',
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
        .eq('hero_design', 'hero3')
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
    <section className="relative min-h-screen">
      {/* Split Layout */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Content */}
        <div className="flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-white via-primary/5 to-secondary/10">
          <div className="max-w-lg space-y-8">
            {/* Floating Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                <Award className="w-3 h-3 mr-1" />
                Award Winning
              </Badge>
              <Badge variant="outline" className="border-primary/30">
                <Users className="w-3 h-3 mr-1" />
                Loved by 30K+
              </Badge>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {heroData.title.split(' ').slice(0, 2).join(' ')}
                <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  {heroData.title.split(' ').slice(2).join(' ')}
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {heroData.subtitle}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {[
                '100% Human Hair Quality',
                'Free Styling Consultation',
                'Lifetime Color Guarantee',
                '30-Day Return Policy'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-6 text-lg font-semibold"
                onClick={() => navigate(heroData.cta_url || '/shop')}
              >
                <ShoppingCart className="mr-2" size={20} />
                {heroData.cta_text || 'Shop Collection'}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg font-semibold"
              >
                <Heart className="mr-2" size={20} />
                Browse Favorites
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-white flex items-center justify-center text-xs font-semibold text-primary"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span>30K+ Happy Customers</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">4.9★★★★★</div>
                  <div>Google Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-accent to-secondary animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-primary animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Main Image */}
          <div className="flex items-center justify-center h-full p-8">
            <div className="relative group">
              <div className="w-80 h-96 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                {heroData.background_image ? (
                  <img 
                    src={heroData.background_image} 
                    alt="Hero Image" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <Sparkles size={60} className="text-white" />
                      </div>
                      <div className="space-y-2 text-white">
                        <p className="text-lg font-semibold">Beautiful Model</p>
                        <p className="text-sm opacity-80">Premium Collection</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">50K+</div>
                  <div className="text-xs text-gray-600">Customers</div>
                </div>
              </div>

              {heroData.featured_product && (
                <div className="absolute top-1/2 -right-8 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg transform translate-y-[-50%] group-hover:translate-x-2 transition-transform duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img 
                        src={heroData.featured_product.image} 
                        alt={heroData.featured_product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{heroData.featured_product.name}</div>
                      <div className="text-lg font-bold text-primary">${heroData.featured_product.price}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero3;