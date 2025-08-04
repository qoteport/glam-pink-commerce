
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-blush-300">HairyTalesBeauty</h3>
            <p className="text-gray-300">
              Your premier destination for premium wigs, hair extensions, and beauty products. 
              Enhancing natural beauty with quality and style.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-blush-300 cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-blush-300 cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-blush-300 cursor-pointer" />
              <Youtube className="w-5 h-5 text-gray-400 hover:text-blush-300 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/shop" className="block text-gray-300 hover:text-blush-300 transition-colors">
                Shop All
              </Link>
              <Link to="/custom-braided-wigs" className="block text-gray-300 hover:text-blush-300 transition-colors">
                Custom Wigs
              </Link>
              <Link to="/wholesale-deals" className="block text-gray-300 hover:text-blush-300 transition-colors">
                Wholesale Deals
              </Link>
              <Link to="/favorites" className="block text-gray-300 hover:text-blush-300 transition-colors">
                My Favorites
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <div className="space-y-2">
              <Link to="/contact" className="block text-gray-300 hover:text-blush-300 transition-colors">
                Contact Us
              </Link>
              <Link to="/shipping" className="block text-gray-300 hover:text-blush-300 transition-colors">
                Shipping Info
              </Link>
              <Link to="/returns" className="block text-gray-300 hover:text-blush-300 transition-colors">
                Returns & Exchanges
              </Link>
              <Link to="/faq" className="block text-gray-300 hover:text-blush-300 transition-colors">
                FAQ
              </Link>
              <Link to="/my-orders" className="block text-gray-300 hover:text-blush-300 transition-colors">
                Track Your Order
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blush-300" />
                <span className="text-gray-300">support@hairytalesbeauty.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blush-300" />
                <span className="text-gray-300">+233 123 456 789</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blush-300 mt-1" />
                <div className="text-gray-300">
                  <p>123 Beauty Street</p>
                  <p>Accra, Ghana</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 HairyTalesBeauty. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-blush-300 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-blush-300 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
