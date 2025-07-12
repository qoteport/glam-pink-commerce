import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

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
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
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
        {/* Product Image */}
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
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

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-blush-600 shadow-lg"
              onClick={handleQuickView}
            >
              <Eye size={16} className="mr-1" />
              Quick View
            </Button>
            <Button
              size="sm"
              className="bg-blush-500 hover:bg-blush-600 text-white shadow-lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={16} className="mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {product.isNew && (
            <Badge className="bg-green-500 text-white">Ready to Ship</Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-rosegold-500 text-white">Best Seller</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white">-{discountPercentage}%</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white w-8 h-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
        >
          <Heart 
            size={16} 
            className={`transition-colors ${
              isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'
            }`} 
          />
        </Button>
      </div>

      {/* Product Info */}
      <CardContent className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Color Options */}
        {product.colors && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Colors:</p>
            <div className="flex space-x-2">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-blush-500 scale-110' 
                      : 'border-gray-200 hover:border-blush-300'
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

        {/* Length Options */}
        {product.lengths && (
          <div className="space-y-2">
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

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <span className="text-lg font-bold text-blush-600">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-2 rounded-lg transition-all duration-300"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
