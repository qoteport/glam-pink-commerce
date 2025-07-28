
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, Instagram, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  image_url?: string;
  location?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface InstagramData {
  instagram_handle?: string;
  hashtag?: string;
  feed_title?: string;
  feed_subtitle?: string;
  display_feed: boolean;
}

interface InstagramPost {
  id: string;
  image_url: string;
  caption?: string;
  likes_count: number;
  post_url?: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [instagramData, setInstagramData] = useState<InstagramData>({
    instagram_handle: '@glamcrownbeauty',
    hashtag: '#GlamCrownLooks',
    feed_title: 'See Real Results on Instagram',
    feed_subtitle: 'Tag us @glamcrownbeauty and use #GlamCrownLooks for a chance to be featured!',
    display_feed: true
  });
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (testimonialsError) throw testimonialsError;
      setTestimonials(testimonialsData || []);

      // Fetch Instagram settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('instagram_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      
      if (settingsData) {
        setInstagramData(settingsData);
      }

      // Fetch Instagram posts
      const { data: postsData, error: postsError } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(6);

      if (postsError) throw postsError;
      setInstagramPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-cream-50 to-blush-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge className="bg-white text-blush-600 border-blush-200 px-4 py-2 shadow-sm">
            💕 Customer Love
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            What Our Beautiful <span className="text-gradient">Queens Say</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it – hear from thousands of satisfied customers 
            who've transformed their look with GlamCrown Beauty.
          </p>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {testimonials.slice(0, 4).map((testimonial) => (
              <Card key={testimonial.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
                <CardContent className="p-6 space-y-4">
                  {/* Header with Customer Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Customer Avatar */}
                      {testimonial.image_url ? (
                        <img
                          src={testimonial.image_url}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blush-300 to-rosegold-300 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                          <Badge className="bg-green-100 text-green-600 text-xs">
                            ✓ Verified
                          </Badge>
                        </div>
                        {testimonial.location && (
                          <p className="text-sm text-gray-600">{testimonial.location}</p>
                        )}
                      </div>
                    </div>
                    {/* Featured Badge */}
                    {testimonial.is_featured && (
                      <Badge className="bg-blush-100 text-blush-600 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {testimonial.rating}.0
                    </span>
                  </div>

                  {/* Review Text */}
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 text-blush-200" size={24} />
                    <p className="text-gray-700 leading-relaxed pl-4">
                      {testimonial.comment}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instagram Feed Section */}
        {instagramData.display_feed && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {instagramData.feed_title || 'See Real Results on Instagram'}
              </h3>
              <p className="text-gray-600">
                {instagramData.feed_subtitle || `Tag us ${instagramData.instagram_handle} and use ${instagramData.hashtag} for a chance to be featured!`}
              </p>
            </div>

            {/* Instagram Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {instagramPosts.length > 0 ? instagramPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer hover-lift"
                  onClick={() => post.post_url && window.open(post.post_url, '_blank')}
                >
                  {/* Image */}
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt="Instagram post" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blush-200 to-rosegold-200 flex items-center justify-center">
                      <Instagram size={32} className="text-white" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center text-white space-y-2">
                      <div className="flex items-center justify-center space-x-1">
                        <Heart size={16} className="fill-current" />
                        <span className="text-sm font-semibold">{post.likes_count}</span>
                      </div>
                      {post.caption && (
                        <p className="text-xs px-2 line-clamp-2">{post.caption}</p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                // Fallback placeholder posts
                Array.from({ length: 6 }, (_, i) => (
                  <div 
                    key={`placeholder-${i}`} 
                    className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer hover-lift"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blush-200 to-rosegold-200 flex items-center justify-center">
                      <Instagram size={32} className="text-white" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Instagram CTA */}
            <div className="text-center">
              <a 
                href={`https://instagram.com/${instagramData.instagram_handle?.replace('@', '') || 'glamcrownbeauty'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Instagram size={20} />
                <span>Follow {instagramData.instagram_handle || '@glamcrownbeauty'}</span>
              </a>
            </div>
          </div>
        )}

        {/* Trust Stats */}
        <div className="mt-16 text-center space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-white/50">
            {[
              { number: '10,000+', label: 'Happy Customers' },
              { number: '4.9/5', label: 'Average Rating' },
              { number: '98%', label: 'Recommend Us' },
              { number: '24/7', label: 'Customer Support' }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl font-bold text-blush-600">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
