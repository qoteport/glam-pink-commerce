import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import PriceDisplay from "./PriceDisplay";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors?: string[];
  lengths?: string[];
  size?: string[];
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

const ProductCard = ({ product, viewMode = "grid" }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedColor, product.lengths?.[0]);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover-lift bg-white cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />
        {/* Fallback Placeholder */}
        <div className="hidden w-full h-full bg-gradient-to-br from-blush-100 to-cream-100 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blush-300 to-rosegold-300 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {product.name.charAt(0)}
              </span>
            </div>
            <p className="text-xs text-blush-600 font-medium px-2">
              {product.name}
            </p>
          </div>
        </div>

        {/* Overlay Actions - Optimized for mobile */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hidden lg:flex">
          <div className="flex flex-col sm:flex-row gap-2 p-2 w-full justify-center">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-blush-600 shadow-lg w-full sm:w-auto"
              onClick={handleQuickView}
            >
              <Eye size={16} className="mr-1 hidden xs:inline" />
              <span className="text-xs sm:text-sm">Quick View</span>
            </Button>
            <Button
              size="sm"
              className="bg-blush-500 hover:bg-blush-600 text-white shadow-lg w-full sm:w-auto "
              onClick={handleAddToCart}
            >
              <ShoppingCart size={16} className="mr-1 hidden xs:inline" />
              <span className="text-xs sm:text-sm">Add to Cart</span>
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1 sm:space-y-2">
          {product.isNew && (
            <Badge className="bg-green-500 text-white text-xs sm:text-sm">Ready to Ship</Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-rosegold-500 text-white text-xs sm:text-sm">Best Seller</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white text-xs sm:text-sm">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white w-7 h-7 sm:w-8 sm:h-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            if (isFavorite(product.id)) {
              removeFromFavorites(product.id);
            } else {
              addToFavorites(product.id);
            }
          }}
        >
          <Heart
            size={14}
            className={`transition-colors ${
              isFavorite(product.id)
                ? "text-primary fill-current"
                : "text-gray-600"
            }`}
          />
        </Button>
      </div>

      {/* Product Info */}
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            {product.rating > 0 && (
              <span className="text-xs sm:text-sm text-gray-600">
                {product.rating} ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Color Options */}
        {product.colors?.length > 0 && (
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs text-gray-600 font-medium">Colors:</p>
            <div className="flex space-x-1 sm:space-x-2">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-blush-500 scale-110"
                      : "border-gray-200 hover:border-blush-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:gap-4 gap-2">
          {/* Length Options */}
          {product.lengths?.length > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs text-gray-600 font-medium">Lengths:</p>
              <div className="flex flex-wrap gap-1">
                {product.lengths.map((length, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-blush-200 hover:border-blush-300 cursor-pointer"
                  >
                    {length}"
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sizes Options */}
          {product.size?.length > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs text-gray-600 font-medium">Sizes:</p>
              <div className="flex flex-wrap gap-1">
                {product.size.map((size, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-blush-200 hover:border-blush-300 cursor-pointer"
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <PriceDisplay
          price={product.price}
          originalPrice={product.originalPrice}
          className="justify-between mt-2"
        />

        {/* Add to Cart Button - Optimized for mobile */}
        <Button
          className="w-full bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-1 sm:py-2 rounded-lg transition-all duration-300 text-sm sm:text-base"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={16} className="mr-1 hidden xs:inline" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;