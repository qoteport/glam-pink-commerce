import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Heart, Menu, X, User, Crown, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/shop' },
    { name: 'Wigs', href: '/shop?category=wigs' },
    { name: 'Bundles', href: '/shop?category=bundles' },
    { name: 'New Arrivals', href: '/shop?filter=new' },
    { name: 'Sale', href: '/shop?filter=sale', isSpecial: true }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blush-100 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blush-50 to-cream-50 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-sm text-blush-600">
            <span>🚚 Free shipping on orders $75+ | 💎 100% Virgin Hair Guarantee</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gradient">
              HairyTalesBeaty
            </h1>
            <span className="ml-2 text-xs bg-rosegold-100 text-rosegold-600 px-2 py-1 rounded-full">
              Premium
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`font-medium transition-colors duration-200 hover:text-blush-500 ${
                  item.isSpecial 
                    ? 'text-rosegold-500 bg-rosegold-50 px-3 py-1 rounded-full' 
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <Input
                type="text"
                placeholder="Search wigs, bundles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-4 pr-10 border-blush-200 focus:border-blush-400"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blush-400 hover:text-blush-600"
              >
                <Search size={18} />
              </button>
            </form>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative hover:bg-blush-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-rosegold-400 to-blush-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </div>
                      {isAdmin && <Crown size={16} className="text-rosegold-500" />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.full_name || 'User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Crown className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-blush-50"
                onClick={() => navigate('/auth')}
              >
                <User size={20} className="text-blush-600" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="relative hover:bg-blush-50">
              <Heart size={20} className="text-blush-600" />
              <Badge className="absolute -top-2 -right-2 bg-rosegold-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                2
              </Badge>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-blush-50"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart size={20} className="text-blush-600" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-rosegold-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {getTotalItems()}
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
        <form onSubmit={handleSearch} className="md:hidden mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search wigs, bundles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 border-blush-200 focus:border-blush-400"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blush-400"
            >
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-blush-100 animate-slide-up">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`font-medium py-2 transition-colors duration-200 hover:text-blush-500 text-left ${
                    item.isSpecial 
                      ? 'text-rosegold-500 bg-rosegold-50 px-3 py-2 rounded-lg' 
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {user && isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="font-medium py-2 text-left text-rosegold-600 bg-rosegold-50 px-3 py-2 rounded-lg"
                >
                  <Crown className="inline mr-2 w-4 h-4" />
                  Admin Dashboard
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
