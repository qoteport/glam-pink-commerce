import React, { useState, useCallback, useEffect, memo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { getTotalItems } = useCart();
  const { favorites, getTotalFavorites } = useFavorites();
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setShowSearch(false);
  }, []);

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
        isScrolled
          ? "shadow-lg border-blush-100"
          : "shadow-sm border-transparent"
      }`}
    >
      {/* Top Bar */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blush-50 to-cream-50 overflow-hidden"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center py-2 text-sm text-blush-600">
                <span className="lg:block hidden">Free shipping on orders</span>
                <div>
                  <span className="lg:hidden">Free shipping on orders</span>
                  <div className="flex flex-row gap-0 lg:ml-1">
                    <PriceDisplay price={1000} designCSS="" className="py-0" />{" "}
                    +
                  </div>
                </div>
                <div className="m-1 mt-0">|</div>
                <span className="">100% Virgin Hair Guarantee</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center">
              <img
                src="../hairytales-logo.png"
                alt="HairyTalesBeauty Logo"
                className={`h-10 w-auto mr-2 mt-2 transition-all duration-300 ${
                  isScrolled ? "hidden" : "hidden md:block"
                }`}
                loading="lazy"
              />
              <h1
                className={`text-xl md:text-2xl font-bold text-gradient ${
                  isScrolled ? "text-2xl" : "lg:text-3xl"
                }`}
              >
                HairyTalesBeauty
              </h1>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {NAV_ITEMS.map((item) =>
              item.isDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="chip"
                      className="font-medium text-sm xl:text-base hover:bg-blush-50"
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
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick(item.href)}
                  className={`font-medium text-sm xl:text-base transition-colors duration-200 ${
                    item.isSpecial
                      ? "text-rosegold-500 bg-rosegold-50 px-3 py-1 rounded-full hover:bg-rosegold-100"
                      : "text-gray-700 hover:text-blush-500"
                  }`}
                >
                  {item.name}
                </motion.button>
              )
            )}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - Desktop */}
            {!showSearch && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSearch}
                className="sm:hidden p-1 text-blush-600"
                aria-label="Search"
              >
                <Search size={20} />
              </motion.button>
            )}

            <form
              onSubmit={handleSearch}
              className={`hidden sm:flex relative ${
                showSearch ? "sm:hidden" : ""
              }`}
            >
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative hover:bg-blush-50 p-1 sm:p-2 rounded-full"
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
                  </motion.button>
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative hover:bg-blush-50 p-1 sm:p-2 rounded-full"
                onClick={() => navigate("/auth")}
                aria-label="Account"
              >
                <User size={20} className="text-blush-600" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative hover:bg-blush-50 hidden md:flex group p-1 sm:p-2 rounded-full"
              onClick={() => navigate("/favorites")}
              aria-label="Favorites"
            >
              <Heart
                size={20}
                className="text-blush-600 group-hover:text-blush-700 transition-colors"
              />
              {getTotalFavorites() > 0 && (
                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-rosegold-500 text-white text-[10px] sm:text-xs min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
                  {getTotalFavorites()}
                </Badge>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative hover:bg-blush-50 group p-1 sm:p-2 rounded-full"
              onClick={() => navigate("/cart")}
              aria-label="Cart"
            >
              <ShoppingCart
                size={20}
                className="text-blush-600 group-hover:text-blush-700 transition-colors"
              />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-rosegold-500 text-white text-[10px] sm:text-xs min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
                  {getTotalItems()}
                </Badge>
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-1 sm:p-2 rounded-full"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {(showSearch || isMenuOpen) && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSearch}
              className="overflow-hidden"
            >
              <div className="relative mt-3">
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
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-blush-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col space-y-3">
                {NAV_ITEMS.map((item) =>
                  item.isDropdown ? (
                    <div key={item.name} className="space-y-1">
                      <div className="font-medium py-2 text-gray-700 border-b border-gray-200">
                        {item.name}
                      </div>
                      {item.items?.map((subItem) => (
                        <motion.button
                          key={subItem.name}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavClick(subItem.href)}
                          className="font-medium py-1.5 pl-4 transition-colors duration-200 hover:text-blush-500 text-left text-gray-600 block w-full text-sm"
                        >
                          {subItem.name}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <motion.button
                      key={item.name}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavClick(item.href)}
                      className={`font-medium py-2 transition-colors duration-200 hover:text-blush-500 text-left text-sm ${
                        item.isSpecial
                          ? "text-rosegold-500 bg-rosegold-50 px-3 py-1.5 rounded-lg"
                          : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </motion.button>
                  )
                )}

                <div className="border-t border-gray-200 pt-3 mt-2 space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavClick("/favorites")}
                    className="flex items-center w-full font-medium py-1.5 text-left text-gray-600 hover:text-blush-500 text-sm"
                  >
                    <Heart size={16} className="mr-2" />
                    Favorites ({favorites.length})
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavClick("/my-orders")}
                    className="flex items-center w-full font-medium py-1.5 text-left text-gray-600 hover:text-blush-500 text-sm"
                  >
                    <Package size={16} className="mr-2" />
                    My Orders
                  </motion.button>
                  {user && isAdmin && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavClick("/admin")}
                      className="flex items-center w-full font-medium py-1.5 text-left text-rosegold-600 bg-rosegold-50 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <Crown className="mr-2 w-4 h-4" />
                      Admin Dashboard
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

export default Header;
