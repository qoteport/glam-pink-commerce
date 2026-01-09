import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, ShoppingCart, Eye, ChevronRight, Sparkles, Zap, Play } from "lucide-react";
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
  liveVideoUrl?: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list" | "horizontal";
  index?: number;
}

const ProductCard = ({ product, viewMode = "grid", index = 0 }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [showVideo, setShowVideo] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle hover timer for video display
  useEffect(() => {
    if (isHovering && product.liveVideoUrl) {
      hoverTimerRef.current = setTimeout(() => {
        setShowVideo(true);
      }, 800); // Reduced for better UX
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      setShowVideo(false);
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovering, product.liveVideoUrl]);

  // Auto-play video when it's shown
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [showVideo]);

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

  const handleVideoPlay = () => {
    setShowVideo(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Determine which variation to use based on index
  const getCardVariation = () => {
    if (viewMode === "horizontal") {
      // Alternate between two horizontal designs every 3 items
      return index % 6 < 3 ? "horizontal-a" : "horizontal-b";
    }
    return viewMode;
  };

  const cardVariation = getCardVariation();

  // Horizontal Variation A
  if (cardVariation === "horizontal-a") {
    return (
      <Card className="group relative overflow-hidden border border-gray-100 shadow-sm hover:shadow-elegant transition-all duration-500 bg-white cursor-pointer rounded-xl">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div 
            className="relative w-full md:w-64 aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                showVideo ? 'opacity-0' : 'opacity-100'
              } ${imageLoaded ? 'scale-100' : 'scale-105'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />

            {/* Video */}
            {product.liveVideoUrl && (
              <div className={`absolute inset-0 transition-all duration-500 ${
                showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <video
                  ref={videoRef}
                  src={product.liveVideoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            )}

            {/* Video Play Button */}
            {product.liveVideoUrl && !showVideo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoPlay();
                }}
                className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <Play size={18} fill="white" />
              </button>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 space-y-2">
              {product.isNew && (
                <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                  <Sparkles size={10} className="mr-1" />
                  New
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Wishlist Button - Always visible */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white w-9 h-9 rounded-full shadow-md hover:shadow-lg transition-all"
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
                size={18}
                className={`transition-all duration-300 ${
                  isFavorite(product.id)
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "text-gray-500"
                }`}
              />
            </Button>
          </div>

          {/* Product Info */}
          <CardContent className="flex-1 p-6 space-y-4">
            {/* Category & Name */}
            <div>
              {product.category && (
                <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                  {product.category}
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 leading-tight mt-1">
                {product.name}
              </h3>
            </div>

            {/* Rating - Only show if reviewCount > 0 */}
            {product.rating > 0 && product.reviewCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(product.rating)
                          ? "text-amber-400 fill-current"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            )}

            {/* Quick Details */}
            <div className="grid grid-cols-2 gap-4 py-2">
              {product.lengths?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Length</p>
                  <div className="flex flex-wrap gap-1">
                    {product.lengths.slice(0, 2).map((length, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-gray-200 px-2"
                      >
                        {length}"
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Colors</p>
                  <div className="flex space-x-2">
                    {product.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="space-y-4 pt-4">
              <PriceDisplay
                price={product.price}
                originalPrice={product.originalPrice}
                className="text-lg"
              />
              
              {/* Quick Actions - Hidden when video is playing */}
              {!showVideo && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 hover:text-gray-900 text-gray-700"
                    onClick={handleQuickView}
                  >
                    <Eye size={16} className="mr-2" />
                    View Details
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Add to Cart
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Horizontal Variation B
  if (cardVariation === "horizontal-b") {
    return (
      <Card className="group relative overflow-hidden border border-gray-100 shadow-sm hover:shadow-elegant transition-all duration-500 bg-white cursor-pointer rounded-xl">
        <div className="flex flex-col lg:flex-row">
          {/* Product Image - Full height */}
          <div 
            className="relative w-full lg:w-72 aspect-[4/3] lg:aspect-auto lg:h-auto overflow-hidden rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="relative w-full h-full">
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  showVideo ? 'opacity-0' : 'opacity-100'
                } ${imageLoaded ? 'scale-100' : 'scale-105'}`}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Video */}
              {product.liveVideoUrl && (
                <div className={`absolute inset-0 transition-all duration-500 ${
                  showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                  <video
                    ref={videoRef}
                    src={product.liveVideoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isBestSeller && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg w-fit">
                    <Zap size={10} className="mr-1" />
                    Trending
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-black/80 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg w-fit">
                    SAVE {discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Info - Minimal Design */}
          <CardContent className="flex-1 p-6 lg:p-8">
            <div className="space-y-5 h-full flex flex-col justify-between">
              <div>
                {/* Category */}
                {product.category && (
                  <span className="text-xs font-medium text-gray-400 tracking-wider uppercase block mb-2">
                    {product.category}
                  </span>
                )}

                {/* Product Name */}
                <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-3">
                  {product.name}
                </h3>

                {/* Rating - Only show if reviewCount > 0 */}
                {product.rating > 0 && product.reviewCount > 0 && (
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.floor(product.rating)
                              ? "text-amber-400 fill-current"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.reviewCount} reviews
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
                  Premium quality hair extensions designed for seamless blending and natural movement.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {product.lengths?.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Lengths:</span>
                      {product.lengths.join('", ')}"
                    </div>
                  )}
                  {product.colors?.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Colors:</span>
                      {product.colors.slice(0, 2).join(', ')}
                      {product.colors.length > 2 && ' + more'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* Price */}
                <PriceDisplay
                  price={product.price}
                  originalPrice={product.originalPrice}
                  className="text-xl mb-6"
                />

                {/* CTA Buttons - Hidden when video is playing */}
                {!showVideo && (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 h-12"
                      onClick={handleQuickView}
                    >
                      <Eye size={18} className="mr-2" />
                      View Details
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white h-12 shadow-md"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                )}

                {/* Wishlist Button */}
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-rose-500"
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
                      size={18}
                      className={`mr-2 ${
                        isFavorite(product.id)
                          ? "fill-rose-500 text-rose-500"
                          : ""
                      }`}
                    />
                    {isFavorite(product.id) ? "Saved" : "Add to Wishlist"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // List View
  if (viewMode === "list") {
    return (
      <Card className="group relative overflow-hidden border border-gray-100 shadow-sm hover:shadow-elegant transition-all duration-500 bg-white cursor-pointer rounded-xl">
        <div className="flex flex-col lg:flex-row">
          {/* Product Image */}
          <div 
            className="relative w-full lg:w-64 aspect-square lg:aspect-[3/4] overflow-hidden rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                showVideo ? 'opacity-0' : 'opacity-100'
              } ${imageLoaded ? 'scale-100' : 'scale-105'}`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Video */}
            {product.liveVideoUrl && (
              <div className={`absolute inset-0 transition-all duration-500 ${
                showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <video
                  ref={videoRef}
                  src={product.liveVideoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
            )}

            {/* Video Play Button */}
            {product.liveVideoUrl && !showVideo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoPlay();
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-all"
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Play className="text-primary ml-1" size={32} />
                </div>
              </button>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 space-y-2">
              {product.isNew && (
                <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                  <Sparkles size={10} className="mr-1" />
                  New
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                  <Zap size={10} className="mr-1" />
                  Best Seller
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <CardContent className="flex-1 p-6 lg:p-8">
            <div className="space-y-4">
              {/* Category & Name */}
              <div>
                {product.category && (
                  <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                    {product.category}
                  </span>
                )}
                <h3 className="text-xl font-semibold text-gray-900 leading-tight mt-1">
                  {product.name}
                </h3>
              </div>

              {/* Rating - Only show if reviewCount > 0 */}
              {product.rating > 0 && product.reviewCount > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(product.rating)
                            ? "text-amber-400 fill-current"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 py-2">
                {product.colors?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Color Options</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {product.lengths?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Lengths</p>
                    <div className="flex flex-wrap gap-2">
                      {product.lengths.map((length, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {length}"
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price & CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-4">
                <PriceDisplay
                  price={product.price}
                  originalPrice={product.originalPrice}
                  className="text-lg"
                />

                {/* CTA Buttons - Hidden when video is playing */}
                {!showVideo && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50 hover:text-gray-900 text-gray-700"
                      onClick={handleQuickView}
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                )}

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 lg:static lg:ml-4"
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
                    size={18}
                    className={`${
                      isFavorite(product.id)
                        ? "fill-rose-500 text-rose-500"
                        : "text-gray-500"
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Default Grid View
  return (
    <Card className="group relative overflow-hidden border border-gray-100 shadow-sm hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 bg-white cursor-pointer rounded-xl">
      {/* Product Image */}
      <div 
        className="relative aspect-[3/4] overflow-hidden rounded-t-xl"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              showVideo ? 'opacity-0' : 'opacity-100'
            } ${imageLoaded ? 'scale-100' : 'scale-105'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Video */}
          {product.liveVideoUrl && (
            <div className={`absolute inset-0 transition-all duration-500 ${
              showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              <video
                ref={videoRef}
                src={product.liveVideoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 space-y-2">
            {product.isNew && (
              <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                <Sparkles size={10} className="mr-1" />
                New
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                <Zap size={10} className="mr-1" />
                Best Seller
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold border-0 shadow-lg">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Quick Actions Overlay - Hidden when video is playing */}
          {!showVideo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/10">
              <div className="flex flex-col items-center gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <Button
                  size="sm"
                  className="bg-white text-gray-800 hover:bg-gray-50 hover:text-gray-900 shadow-lg px-6 py-2 rounded-full font-medium"
                  onClick={handleQuickView}
                >
                  <Eye size={16} className="mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white shadow-lg px-6 py-2 rounded-full font-medium"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}

          {/* Video Play Button */}
          {/* {product.liveVideoUrl && !showVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVideoPlay();
              }}
              className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            >
              <Play size={18} fill="white" />
            </button>
          )} */}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white w-9 h-9 rounded-full shadow-md hover:shadow-lg transition-all"
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
              size={18}
              className={`transition-all duration-300 ${
                isFavorite(product.id)
                  ? "fill-rose-500 text-rose-500 scale-110"
                  : "text-gray-500"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-5 space-y-4">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium text-gray-400 tracking-wider uppercase block">
            {product.category}
          </span>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Rating - Only show if reviewCount > 0 */}
        {product.rating > 0 && product.reviewCount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(product.rating)
                        ? "text-amber-400 fill-current"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviewCount})
              </span>
            </div>
          </div>
        )}

        {/* Color Options */}
        {product.colors?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Colors</span>
              <span className="text-xs font-medium text-gray-700">{selectedColor}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.slice(0, 4).map((color, index) => (
                <button
                  key={index}
                  className={`w-5 h-5 rounded-full border transition-all duration-300 ${
                    selectedColor === color
                      ? "border-gray-800 scale-110 ring-1 ring-gray-300"
                      : "border-gray-200 hover:border-gray-300"
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

        <div className="space-y-3 pt-2">
          {/* Price */}
          <PriceDisplay
            price={product.price}
            originalPrice={product.originalPrice}
            className="text-lg"
          />

          {/* View Details CTA */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">{product.isNew ? 'Now Available': 'In stock'}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-blush-600 hover:text-blush-700 hover:bg-blush-50 text-xs font-medium"
              onClick={handleCardClick}
            >
              View Details
              <ChevronRight size={12} className="ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;