import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Heart, Menu, X, User, Crown, LogOut, ChevronDown } from 'lucide-react';
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
    { name: 'Shop', href: '/shop' },
    { name: 'Wigs', href: '/shop?category=wigs' },
    { name: 'Wholesale Deals', href: '/wholesale-deals', isSpecial: true },
    { 
      name: 'More', 
      href: '#',
      isDropdown: true,
      items: [
        { name: 'Customized Braided Wigs', href: '/custom-braided-wigs' },
        { name: 'Ready to Ship Wigs', href: '/shop?category=ready-to-ship-wigs' },
        { name: 'Wholesale Deals', href: '/wholesale-deals' }
      ]
    }
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
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-blush-500 hover:bg-blush-50 p-0 h-auto px-3"
                    >
                      {item.name}
                      <ChevronDown size={16} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border border-blush-100 shadow-lg">
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem
                        key={subItem.name}
                        onClick={() => handleNavClick(subItem.href)}
                        className="hover:bg-blush-50 hover:text-blush-600 cursor-pointer"
                      >
                        {subItem.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
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
              )
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
                <DropdownMenuContent align="end" className="w-56 bg-white border border-blush-100 shadow-lg">
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
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-blush-50 hover:text-blush-600 cursor-pointer">
                        <Crown className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-blush-50 hover:text-blush-600 cursor-pointer">
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
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-blush-50 hidden md:flex group"
              onClick={() => navigate('/favorites')}
            >
              <Heart size={20} className="text-blush-600 group-hover:text-blush-700 transition-colors" />
              <Badge className="absolute -top-2 -right-2 bg-rosegold-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                2
              </Badge>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-blush-50 group"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart size={20} className="text-blush-600 group-hover:text-blush-700 transition-colors" />
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
              className="lg:hidden text-blush-600 hover:text-blush-700 hover:bg-blush-50"
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
                item.isDropdown ? (
                  <div key={item.name} className="space-y-2">
                    <div className="font-medium py-2 text-gray-700 border-b border-gray-200">
                      {item.name}
                    </div>
                    {item.items?.map((subItem) => (
                      <button
                        key={subItem.name}
                        onClick={() => handleNavClick(subItem.href)}
                        className="font-medium py-2 pl-4 transition-colors duration-200 hover:text-blush-500 text-left text-gray-600 block w-full"
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                ) : (
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
                )
              ))}
               
                {/* Mobile-only menu items */}
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <button 
                    onClick={() => {
                      navigate('/favorites');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full font-medium py-2 text-left text-gray-600 hover:text-blush-500"
                  >
                    <Heart size={16} className="mr-2" />
                    Favorites
                  </button>
                  {user && isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full font-medium py-2 text-left text-rosegold-600 bg-rosegold-50 px-3 py-2 rounded-lg"
                    >
                      <Crown className="mr-2 w-4 h-4" />
                      Admin Dashboard
                    </button>
                  )}
                </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
