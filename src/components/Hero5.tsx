
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface HeroData {
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  background_image?: string;
  video_url?: string;
  featured_product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

const Hero5 = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'Transform Your Look',
    subtitle: 'Experience the beauty of premium wigs and extensions with our exclusive collection.',
    cta_text: 'Watch Our Story',
    cta_url: '/shop'
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

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
        .eq('hero_design', 'hero5')
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
          video_url: data.background_image, // Using background_image field for video URL
          featured_product: data.products,
        });
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
    }
  };

  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {heroData.video_url && heroData.video_url.includes('.mp4') ? (
          <video
            ref={setVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
          >
            <source src={heroData.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : heroData.background_image ? (
          <img 
            src={heroData.background_image} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-600 via-pink-400 to-pink-200 flex items-center justify-center">
            <div className="text-center space-y-4 opacity-50">
              <Crown size={120} className="text-white mx-auto" />
              <p className="text-2xl font-semibold text-white">Upload your video or image</p>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>
      </div>

      {/* Video Controls */}
      {heroData.video_url && heroData.video_url.includes('.mp4') && (
        <div className="absolute top-8 right-8 z-20 flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-white/20"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-white/20"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="bg-pink-500/90 text-white border-0 mb-6 text-lg px-6 py-3 backdrop-blur-sm">
              🎥 Watch Our Story
            </Badge>

            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight mb-6">
              {heroData.title.split(' ').slice(0, 2).join(' ')}
              <span className="block bg-gradient-to-r from-pink-300 to-white bg-clip-text text-transparent">
                {heroData.title.split(' ').slice(2).join(' ')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-10 max-w-3xl mx-auto">
              {heroData.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300"
                onClick={() => navigate(heroData.cta_url || '/shop')}
              >
                {heroData.cta_text || 'Shop Collection'}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/50 text-white hover:bg-white/10 px-10 py-6 text-xl font-semibold rounded-full backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-8 text-white">
          <div className="text-center">
            <div className="text-3xl font-bold">50K+</div>
            <div className="text-sm opacity-80">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-sm opacity-80">Premium Styles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">4.9★</div>
            <div className="text-sm opacity-80">Customer Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero5;
