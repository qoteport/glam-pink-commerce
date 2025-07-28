
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube,
  TikTok,
  Linkedin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  followers_count: number;
  is_active: boolean;
}

const Footer = () => {
  const [email, setEmail] = useState('');
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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    // Handle newsletter subscription here
    setEmail('');
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
      case 'tiktok':
        return TikTok;
      case 'linkedin':
        return Linkedin;
      default:
        return Instagram;
    }
  };

  const formatFollowersCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">GlamCrown Beauty</h3>
            <p className="text-gray-300 text-sm">
              Your premier destination for high-quality wigs, hair bundles, and beauty accessories. 
              Transform your look with confidence.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const IconComponent = getSocialIcon(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-blush-600 p-2 rounded-full transition-colors"
                    title={`Follow us on ${link.platform}`}
                  >
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/shop" className="hover:text-blush-400 transition-colors">Shop All</a></li>
              <li><a href="/shop?category=wigs" className="hover:text-blush-400 transition-colors">Wigs</a></li>
              <li><a href="/shop?category=bundles" className="hover:text-blush-400 transition-colors">Hair Bundles</a></li>
              <li><a href="/shop?category=closures" className="hover:text-blush-400 transition-colors">Closures</a></li>
              <li><a href="/custom-braided-wigs" className="hover:text-blush-400 transition-colors">Custom Wigs</a></li>
              <li><a href="/wholesale-deals" className="hover:text-blush-400 transition-colors">Wholesale</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Customer Service</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-blush-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-blush-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-blush-400 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-blush-400 transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-blush-400 transition-colors">Hair Care</a></li>
              <li><a href="#" className="hover:text-blush-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Stay Connected</h4>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Subscribe for updates and exclusive offers</p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-blush-600 hover:bg-blush-700 text-white"
                >
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>1-800-GLAMCROWN</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>hello@glamcrownbeauty.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>Mon-Fri: 9AM-6PM EST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Follow Us for Daily Hair Inspiration */}
        {socialLinks.length > 0 && (
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="text-center space-y-4">
              <h4 className="text-lg font-semibold">Follow Us for Daily Hair Inspiration</h4>
              <div className="flex justify-center space-x-6">
                {socialLinks.map((link) => {
                  const IconComponent = getSocialIcon(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 hover:text-blush-400 transition-colors group"
                    >
                      <div className="bg-gray-800 group-hover:bg-blush-600 p-3 rounded-full transition-colors">
                        <IconComponent size={24} />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{link.platform}</div>
                        {link.followers_count > 0 && (
                          <div className="text-xs text-gray-400">
                            {formatFollowersCount(link.followers_count)} followers
                          </div>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 GlamCrown Beauty. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-blush-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blush-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blush-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
