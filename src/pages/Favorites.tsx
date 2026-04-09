import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import PriceDisplay from "@/components/PriceDisplay";

const Favorites = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, removeFromFavorites, loading } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchFavoriteProducts();
  }, [favorites]);

  const fetchFavoriteProducts = async () => {
    if (favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", favorites);

      if (error) throw error;

      const transformedProducts =
        data?.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price,
          image: product.image,
          rating: product.rating || 0,
          reviewCount: product.review_count || 0,
          colors: product.colors || [],
          lengths: product.lengths || [],
        })) || [];

      setFavoriteProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching favorite products:", error);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mb-[70px]">
          <Header />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mb-[70px]">
          <Header />
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart size={64} className="mx-auto text-blush-300 mb-6" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              No favorites yet
            </h1>
            <p className="text-gray-600 mb-8">
              Save your favorite wigs and bundles here for easy access later.
            </p>
            <Button
              onClick={() => navigate("/shop")}
              className="bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white"
            >
              Start Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mb-[70px]">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 px-0 pr-1 text-blush-600 hover:text-blush-700 hover:bg-blush-50"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              My Favorites ({favoriteProducts.length} items)
            </h1>
            <p className="text-gray-600 mt-2">
              Your saved wigs and hair bundles
            </p>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300 border-blush-100"
            >
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="relative mb-4">
                  <div className="aspect-square bg-gradient-to-br from-blush-100 to-cream-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                    onClick={() => removeFromFavorites(product.id)}
                  >
                    <Heart size={16} fill="currentColor" />
                  </Button>

                  {/* Discount Badge */}
                  {product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-rosegold-500 text-white">
                      Save ${product.originalPrice - product.price}
                    </Badge>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blush-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>

                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviewCount})
                      </span>

                    </div>)}

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <PriceDisplay
                      price={product.price}
                      originalPrice={product.originalPrice}
                      className="justify-between"
                    />
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Colors */}
                  {product.colors.length > 0 && (<div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Colors:</span>
                    <div className="flex space-x-1">
                      {product.colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{product.colors.length - 3}
                        </span>
                      )}
                    </div>
                  </div>)}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white"
                      size="sm"
                    >
                      <ShoppingCart size={14} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const slug = product.name ? `${product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-')}-${product.id.split('-')[0]}` : product.id;
                        navigate(`/product/${slug}`);
                      }}
                      className="border-blush-300 text-blush-600 hover:bg-blush-50"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Favorites;
