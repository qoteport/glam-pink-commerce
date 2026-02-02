import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getTotalItems } = useCart();
    const { getTotalFavorites } = useFavorites();
    const { user } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const navItems = [
        {
            label: 'Home',
            icon: Home,
            path: '/',
        },
        {
            label: 'Shop',
            icon: Search,
            path: '/shop',
        },
        {
            label: 'Cart',
            icon: ShoppingCart,
            path: '/cart',
            badge: getTotalItems(),
        },
        {
            label: 'Favorites',
            icon: Heart,
            path: '/favorites',
            badge: getTotalFavorites(),
        },
        {
            label: user ? 'Profile' : 'Login',
            icon: User,
            path: user ? '/profile' : '/auth',
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden safe-area-bottom">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 relative",
                                active ? "text-rosegold-500" : "text-gray-500 hover:text-rosegold-400"
                            )}
                        >
                            <div className="relative">
                                <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
                                {item.badge ? (
                                    <Badge className="absolute -top-2 -right-2 bg-rosegold-500 text-white text-[10px] w-4 h-4 flex items-center justify-center p-0 border-white border-[1px]">
                                        {item.badge}
                                    </Badge>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
