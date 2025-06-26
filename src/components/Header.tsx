
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Heart, Menu, X, User } from 'lucide-react';
import { Instagram, Facebook, Youtube, Twitter, Linkedin } from 'lucide-react';

interface HeaderProps {
  cartCount?: number;
}

const Header = ({ cartCount = 0 }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Shop All', href: '#shop' },
    { name: 'Wigs', href: '#wigs' },
    { name: 'Bundles', href: '#bundles' },
    { name: 'New Arrivals', href: '#new' },
    { name: 'Sale', href: '#sale', isSpecial: true },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: '@glamcrownbeauty' },
    { icon: Facebook, href: '#', label: 'GlamCrown Beauty' },
    { icon: Youtube, href: '#', label: 'GlamCrown Beauty' },
    { icon: Twitter, href: '#', label: '@glamcrownhair' },
    { icon: Linkedin, href: '#', label: 'GlamCrown Beauty' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blush-100 shadow-sm">
      {/* Top Bar with Social Links */}
      <div className="bg-gradient-to-r from-blush-50 to-cream-50 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-blush-600 font-medium">Follow us for hair tips & glam deals:</span>
              <div className="flex items-center space-x-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-blush-500 hover:text-rosegold-500 transition-colors duration-200"
                    title={social.label}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-blush-600">
              <span>🚚 Free shipping on orders $75+</span>
              <span>💎 100% Virgin Hair Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient">
              GlamCrown Beauty
            </h1>
            <span className="ml-2 text-xs bg-rosegold-100 text-rosegold-600 px-2 py-1 rounded-full">
              Premium
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors duration-200 hover:text-blush-500 ${
                  item.isSpecial 
                    ? 'text-rosegold-500 bg-rosegold-50 px-3 py-1 rounded-full' 
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex relative">
              <Input
                type="text"
                placeholder="Search wigs, bundles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-4 pr-10 border-blush-200 focus:border-blush-400"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blush-400" size={18} />
            </div>

            {/* Action Buttons */}
            <Button variant="ghost" size="sm" className="relative hover:bg-blush-50">
              <User size={20} className="text-blush-600" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative hover:bg-blush-50">
              <Heart size={20} className="text-blush-600" />
              <Badge className="absolute -top-2 -right-2 bg-rosegold-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                2
              </Badge>
            </Button>

            <Button variant="ghost" size="sm" className="relative hover:bg-blush-50">
              <ShoppingCart size={20} className="text-blush-600" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-rosegold-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search wigs, bundles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 border-blush-200 focus:border-blush-400"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blush-400" size={18} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-blush-100 animate-slide-up">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`font-medium py-2 transition-colors duration-200 hover:text-blush-500 ${
                    item.isSpecial 
                      ? 'text-rosegold-500 bg-rosegold-50 px-3 py-2 rounded-lg' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
