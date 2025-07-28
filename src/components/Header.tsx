import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { getTotalFavorites } = useFavorites();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blush-400 to-rosegold-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">HT</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blush-600 to-rosegold-600 bg-clip-text text-transparent">
              Hairy Tales Beauty
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blush-600 transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-blush-600 transition-colors">
              Shop
            </Link>
            <Link to="/custom-braided-wigs" className="text-gray-700 hover:text-blush-600 transition-colors">
              Custom Wigs
            </Link>
            <Link to="/wholesale-deals" className="text-gray-700 hover:text-blush-600 transition-colors">
              Wholesale
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Search className="w-5 h-5" />
            </Button>
            
            <Link to="/favorites">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="w-5 h-5" />
                {getTotalFavorites() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-rosegold-500 text-white text-xs px-1 py-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {getTotalFavorites()}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-blush-500 text-white text-xs px-1 py-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/my-orders">
                  <Button variant="ghost" size="sm" className="relative">
                    <Package className="w-5 h-5" />
                    <span className="ml-1 hidden lg:inline">Orders</span>
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600">
                  <User className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blush-600 transition-colors" onClick={toggleMenu}>
                Home
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-blush-600 transition-colors" onClick={toggleMenu}>
                Shop
              </Link>
              <Link to="/custom-braided-wigs" className="text-gray-700 hover:text-blush-600 transition-colors" onClick={toggleMenu}>
                Custom Wigs
              </Link>
              <Link to="/wholesale-deals" className="text-gray-700 hover:text-blush-600 transition-colors" onClick={toggleMenu}>
                Wholesale
              </Link>
              <Link to="/favorites" className="text-gray-700 hover:text-blush-600 transition-colors flex items-center" onClick={toggleMenu}>
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({getTotalFavorites()})
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-blush-600 transition-colors flex items-center" onClick={toggleMenu}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Cart ({getTotalItems()})
              </Link>
              {user ? (
                <>
                  <Link to="/my-orders" className="text-gray-700 hover:text-blush-600 transition-colors flex items-center" onClick={toggleMenu}>
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-gray-700 hover:text-blush-600 transition-colors" onClick={toggleMenu}>
                      Admin
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { handleSignOut(); toggleMenu(); }} className="justify-start">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={toggleMenu}>
                  <Button variant="default" size="sm" className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600">
                    <User className="w-4 h-4 mr-1" />
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
