
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionForm from './SubscriptionForm';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  followers_count: number;
}

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'instagram':
        return Instagram;
      case 'facebook':
        return Facebook;
      case 'twitter':
        return Twitter;
      case 'youtube':
        return Youtube;
      default:
        return Users;
    }
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Follow Us Section - First Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-blush-400" />
                <h3 className="text-xl font-bold text-white">Follow Us</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                For Daily Hair Inspiration
              </p>
            </div>

            {/* Social Media Links */}
            <div className="space-y-3">
              {socialLinks.map((link) => {
                const IconComponent = getSocialIcon(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-blush-400 group-hover:text-blush-300" />
                      <span className="font-medium text-white">{link.platform}</span>
                    </div>
                    {link.followers_count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-blush-400/20 text-blush-200 border-blush-400/30"
                      >
                        {formatFollowerCount(link.followers_count)}
                      </Badge>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Shop All', href: '/shop' },
                { name: 'Best Sellers', href: '/shop?filter=best-sellers' },
                { name: 'New Arrivals', href: '/shop?filter=new' },
                { name: 'Custom Wigs', href: '/custom-braided-wigs' },
                { name: 'Wholesale', href: '/wholesale-deals' }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-blush-300 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Customer Service</h3>
            <ul className="space-y-3">
              {[
                { name: 'Contact Us', href: '/contact' },
                { name: 'Shipping Info', href: '/shipping' },
                { name: 'Returns & Exchanges', href: '/returns' },
                { name: 'Size Guide', href: '/size-guide' },
                { name: 'Care Instructions', href: '/care' }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-blush-300 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Stay Connected</h3>
              <p className="text-gray-300 text-sm">
                Get the latest updates on new products, exclusive offers, and hair care tips.
              </p>
              <SubscriptionForm />
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Contact Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blush-400" />
                  <span className="text-gray-300">support@glamcrownbeauty.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blush-400" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blush-400" />
                  <span className="text-gray-300">New York, NY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blush-400 to-rosegold-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-white">GlamCrown Beauty</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <span>© 2024 GlamCrown Beauty. All rights reserved.</span>
              <div className="flex space-x-4">
                <a href="/privacy" className="hover:text-blush-300 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-blush-300 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
