
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Crown,
  Heart,
  Star,
  Gift,
  Truck,
  Shield,
  Clock
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { icon: Instagram, href: '#', label: '@hairytalesbeaty', followers: '45K' },
    { icon: Facebook, href: '#', label: 'HairyTalesBeaty', followers: '32K' },
    { icon: Youtube, href: '#', label: 'HairyTalesBeaty', followers: '28K' },
    { icon: Twitter, href: '#', label: '@hairytalesbeaty', followers: '15K' },
    { icon: Linkedin, href: '#', label: 'HairyTalesBeaty', followers: '8K' }
  ];

  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Size Guide', href: '#size-guide' },
    { name: 'Hair Care Tips', href: '#hair-care' },
    { name: 'Installation Guide', href: '#installation' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Affiliate Program', href: '#affiliate' }
  ];

  const customerService = [
    { name: 'Contact Us', href: '#contact' },
    { name: 'Shipping Info', href: '#shipping' },
    { name: 'Returns & Exchanges', href: '#returns' },
    { name: 'Size Exchange', href: '#size-exchange' },
    { name: 'Track Your Order', href: '#track' },
    { name: 'FAQ', href: '#faq' }
  ];

  const categories = [
    { name: 'Lace Front Wigs', href: '#lace-front' },
    { name: 'Full Lace Wigs', href: '#full-lace' },
    { name: 'Hair Bundles', href: '#bundles' },
    { name: 'Closures & Frontals', href: '#closures' },
    { name: 'Colored Wigs', href: '#colored' },
    { name: 'Sale Items', href: '#sale' }
  ];

  const trustFeatures = [
    { icon: Shield, text: '100% Virgin Hair Guarantee' },
    { icon: Truck, text: 'Free Shipping Over $75' },
    { icon: Clock, text: '30-Day Return Policy' },
    { icon: Gift, text: 'Free Styling Guide' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-blush-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blush-600 to-rosegold-600 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                ✨ Join the Beauty Squad & Stay Connected ✨
              </h3>
              <p className="text-blush-100 max-w-2xl mx-auto">
                Get exclusive access to new arrivals, styling tips, and special offers. 
                Plus, receive 10% off your first order!
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                required
              />
              <Button 
                type="submit"
                className="bg-white text-blush-600 hover:bg-gray-100 font-semibold px-6"
              >
                {isSubscribed ? '✓ Subscribed!' : 'Subscribe'}
              </Button>
            </form>

            {/* Social Media Links */}
            <div className="space-y-4">
              <p className="text-blush-100">Follow us for daily hair inspiration:</p>
              <div className="flex justify-center space-x-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="group flex flex-col items-center space-y-1 hover:scale-110 transition-transform duration-200"
                    title={social.label}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <social.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs text-blush-100">{social.followers}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Crown size={32} className="text-blush-400" />
                  <h4 className="text-2xl font-bold text-gradient">HairyTalesBeaty</h4>
                </div>
                <p className="text-gray-300 leading-relaxed max-w-md">
                  Your premier destination for high-quality wigs and hair bundles. 
                  We're dedicated to helping every woman feel beautiful, confident, and glamorous.
                </p>
              </div>

              {/* Trust Features */}
              <div className="space-y-3">
                {trustFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon size={16} className="text-blush-400" />
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h5 className="font-semibold text-white">Get in Touch</h5>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="text-blush-400" />
                    <span>1-800-GLAMCROWN (1-800-452-6276)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-blush-400" />
                    <span>hello@hairytalesbeaty.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-blush-400" />
                    <span>Los Angeles, CA & Atlanta, GA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h5 className="font-semibold text-white text-lg">Quick Links</h5>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-gray-300 hover:text-blush-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h5 className="font-semibold text-white text-lg">Customer Service</h5>
              <ul className="space-y-2">
                {customerService.map((service, index) => (
                  <li key={index}>
                    <a 
                      href={service.href}
                      className="text-gray-300 hover:text-blush-400 transition-colors duration-200 text-sm"
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h5 className="font-semibold text-white text-lg">Shop Categories</h5>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <a 
                      href={category.href}
                      className="text-gray-300 hover:text-blush-400 transition-colors duration-200 text-sm"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Bottom Footer */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© 2024 HairyTalesBeaty. All rights reserved.</span>
              <Separator orientation="vertical" className="h-4 bg-gray-600" />
              <a href="#" className="hover:text-blush-400 transition-colors">Privacy Policy</a>
              <Separator orientation="vertical" className="h-4 bg-gray-600" />
              <a href="#" className="hover:text-blush-400 transition-colors">Terms of Service</a>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart size={16} className="text-red-400 fill-current" />
              <span>for beautiful women everywhere</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
