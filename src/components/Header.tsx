import React, { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  User,
  Crown,
  LogOut,
  ChevronDown,
  Package,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { debounce } from "lodash";
import PriceDisplay from "./PriceDisplay";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Wigs", href: "/shop?status=wigs" },
  { name: "Wholesale Deals", href: "/wholesale-deals", isSpecial: true },
  {
    name: "More",
    href: "#",
    isDropdown: true,
    items: [
      { name: "Customized Braided Wigs", href: "/custom-braided-wigs" },
      { name: "Ready to Ship Wigs", href: "/shop?status=ready-to-ship-wigs" },
      { name: "Wholesale Deals", href: "/wholesale-deals" },
    ],
  },
];

const Header = memo(({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalItems } = useCart();
  const { favorites, getTotalFavorites } = useFavorites();
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        if (onSearch) {
          onSearch(query);
        } else {
          navigate(`/shop?search=${encodeURIComponent(query)}`);
        }
      }
    }, 300),
    [onSearch, navigate]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Optional: Trigger search on type for better UX
    // debouncedSearch(e.target.value);
  };

  const handleNavClick = useCallback(
    (href: string) => {
      navigate(href);
      setIsMenuOpen(false);
    },
    [navigate]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blush-100 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blush-50 to-cream-50 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-sm text-blush-600">
            <span className="text-center">🚚 Free shipping on orders {" "}
            </span>
            <PriceDisplay price={1000} designCSS="" className="py-0 pl-1" />
             <span className="text-center"> + |💎 100% Virgin Hair Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center">
              <img
                src="../hairytales-logo.png"
                alt="HairyTalesBeauty Logo"
                className="h-10 w-auto mr-2 mp-4 pt-2 hidden md:block"
                loading="lazy"
              />
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient">
                HairyTalesBeauty
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {NAV_ITEMS.map((item) =>
              item.isDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="chip"
                      className="font-medium text-sm xl:text-base"
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
                        className="hover:bg-blush-50 hover:text-blush-600 cursor-pointer text-foreground"
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
                  className={`font-medium text-sm xl:text-base transition-colors duration-200 hover:text-blush-500 ${
                    item.isSpecial
                      ? "text-rosegold-500 bg-rosegold-50 px-3 py-1 rounded-full"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </button>
              )
            )}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - Hidden on smallest mobile */}
            <form onSubmit={handleSearch} className="hidden sm:flex relative">
              <Input
                type="text"
                placeholder="Search wigs, bundles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-40 md:w-56 lg:w-64 pl-4 pr-10 border-blush-200 focus:border-blush-400 text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blush-400 hover:text-blush-600"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </form>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:bg-blush-50 p-1 sm:p-2"
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-rosegold-400 to-blush-400 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                        {profile?.full_name
                          ? profile.full_name.charAt(0).toUpperCase()
                          : user.email?.charAt(0).toUpperCase()}
                      </div>
                      {isAdmin && (
                        <Crown
                          size={14}
                          className="text-rosegold-500 hidden sm:block"
                        />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-blush-100 shadow-lg"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleNavClick("/my-orders")}
                    className="hover:bg-blush-50 hover:text-blush-600 cursor-pointer text-foreground"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleNavClick("/admin")}
                        className="hover:bg-blush-50 hover:text-blush-600 cursor-pointer text-foreground"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="hover:bg-blush-50 hover:text-blush-600 cursor-pointer text-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-blush-50 p-1 sm:p-2"
                onClick={() => navigate("/auth")}
                aria-label="Account"
              >
                <User size={18} className="text-blush-600" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-blush-50 hidden md:flex group p-1 sm:p-2"
              onClick={() => navigate("/favorites")}
              aria-label="Favorites"
            >
              <Heart
                size={18}
                className="text-blush-600 group-hover:text-blush-700 transition-colors"
              />
              {getTotalFavorites() > 0 && (
                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-rosegold-500 text-white text-[10px] sm:text-xs min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
                  {getTotalFavorites()}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-blush-50 group p-1 sm:p-2"
              onClick={() => navigate("/cart")}
              aria-label="Cart"
            >
              <ShoppingCart
                size={18}
                className="text-blush-600 group-hover:text-blush-700 transition-colors"
              />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-rosegold-500 text-white text-[10px] sm:text-xs min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1 sm:p-2"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Search - Only shown when menu is closed */}
        {!isMenuOpen && (
          <form onSubmit={handleSearch} className="sm:hidden mt-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search wigs, bundles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-4 pr-10 border-blush-200 focus:border-blush-400 text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blush-400"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-blush-100 animate-slide-down">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col space-y-3">
              {NAV_ITEMS.map((item) =>
                item.isDropdown ? (
                  <div key={item.name} className="space-y-1">
                    <div className="font-medium py-2 text-gray-700 border-b border-gray-200">
                      {item.name}
                    </div>
                    {item.items?.map((subItem) => (
                      <button
                        key={subItem.name}
                        onClick={() => handleNavClick(subItem.href)}
                        className="font-medium py-1.5 pl-4 transition-colors duration-200 hover:text-blush-500 text-left text-gray-600 block w-full text-sm"
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className={`font-medium py-2 transition-colors duration-200 hover:text-blush-500 text-left text-sm ${
                      item.isSpecial
                        ? "text-rosegold-500 bg-rosegold-50 px-3 py-1.5 rounded-lg"
                        : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </button>
                )
              )}

              {/* Mobile-only menu items */}
              <div className="border-t border-gray-200 pt-3 mt-2 space-y-2">
                <button
                  onClick={() => handleNavClick("/favorites")}
                  className="flex items-center w-full font-medium py-1.5 text-left text-gray-600 hover:text-blush-500 text-sm"
                >
                  <Heart size={16} className="mr-2" />
                  Favorites ({favorites.length})
                </button>
                <button
                  onClick={() => handleNavClick("/my-orders")}
                  className="flex items-center w-full font-medium py-1.5 text-left text-gray-600 hover:text-blush-500 text-sm"
                >
                  <Package size={16} className="mr-2" />
                  My Orders
                </button>
                {user && isAdmin && (
                  <button
                    onClick={() => handleNavClick("/admin")}
                    className="flex items-center w-full font-medium py-1.5 text-left text-rosegold-600 bg-rosegold-50 px-3 py-1.5 rounded-lg text-sm"
                  >
                    <Crown className="mr-2 w-4 h-4" />
                    Admin Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

export default Header;
