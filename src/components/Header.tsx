import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ShoppingCart, User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const Header = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const { toast } = useToast()

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold">
           <img
                src="hairytales-logo.png"
                alt="HairyTalesBeauty Logo"
                className={`h-10 w-auto mr-2 mt-2 transition-all duration-300`}
                loading="lazy"
              />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/shop" className="hover:text-gray-600">Shop</Link>
          <Link to="/custom-braided-wigs" className="hover:text-gray-600">Custom Braided Wigs</Link>
          <Link to="/wholesale-deals" className="hover:text-gray-600">Wholesale Deals</Link>
          <Link to="/contact" className="hover:text-gray-600">Contact</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative hover:text-gray-600">
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs font-bold">{cart.length}</Badge>
            )}
          </Link>
          <Link to="/favorites" className="relative hover:text-gray-600">
            <Heart className="h-5 w-5" />
             {favorites.length > 0 && (
              <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs font-bold">{favorites.length}</Badge>
            )}
          </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="bg-blush-100 text-blush-700">
                        {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/auth')}>
                Sign Up
              </Button>
            </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
