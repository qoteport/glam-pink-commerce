
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Star, Sparkles, Crown } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-blush-50 to-rosegold-50 min-h-[80vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-float">
          <Crown size={40} className="text-rosegold-300" />
        </div>
        <div className="absolute top-32 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <Sparkles size={30} className="text-blush-300" />
        </div>
        <div className="absolute bottom-20 left-20 animate-float" style={{ animationDelay: '2s' }}>
          <Star size={35} className="text-rosegold-300" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white/80 text-blush-600 border-blush-200 hover:bg-white">
                ⭐ 100% Virgin Hair
              </Badge>
              <Badge className="bg-white/80 text-blush-600 border-blush-200 hover:bg-white">
                🚚 Free Returns
              </Badge>
              <Badge className="bg-white/80 text-blush-600 border-blush-200 hover:bg-white">
                💝 Fast Shipping
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Unleash Your
                <span className="block text-gradient">Inner Glam</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                Premium wigs and hair bundles that transform your look and boost your confidence. 
                Join thousands of beautiful women who trust GlamCrown Beauty.
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blush-200 to-rosegold-200 border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-xs font-semibold text-blush-600">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="ml-3">
                  <strong className="text-blush-600">10K+</strong> happy customers
                </span>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
                <span className="ml-2">4.9/5 rating</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Shop Premium Wigs
                <ChevronRight className="ml-2" size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-blush-300 text-blush-600 hover:bg-blush-50 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                View Collections
              </Button>
            </div>

            {/* Special Offer */}
            <div className="p-4 bg-white/60 rounded-2xl border border-blush-200 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-rosegold-400 to-blush-400 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-blush-700">Limited Time Offer!</p>
                  <p className="text-sm text-gray-600">Get 20% off your first order + free styling guide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <div className="aspect-[4/5] bg-gradient-to-br from-blush-100 to-rosegold-100 flex items-center justify-center">
                  {/* Placeholder for hero image */}
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blush-300 to-rosegold-300 rounded-full flex items-center justify-center">
                      <Crown size={60} className="text-white" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-blush-700">Beautiful Model</p>
                      <p className="text-sm text-gray-600">Wearing Premium Lace Front Wig</p>
                    </div>
                  </div>
                </div>
                
                {/* Overlay elements */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-rosegold-600 font-semibold">
                    🔥 Best Seller
                  </Badge>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blush-700">Brazilian Curly Lace Front</p>
                        <p className="text-sm text-gray-600">22" Natural Color</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-rosegold-600">$299</p>
                        <p className="text-xs text-gray-500 line-through">$399</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-cream-200 to-blush-200 rounded-full opacity-60 animate-float"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-rosegold-200 to-blush-200 rounded-full opacity-40 animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-16 text-white">
          <path fill="currentColor" d="M0,64L1440,96L1440,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
