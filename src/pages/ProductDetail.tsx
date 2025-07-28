
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw, 
  ChevronLeft,
  ChevronRight,
  Play,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedLength, setSelectedLength] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          discounts (
            id,
            name,
            type,
            value,
            code,
            is_active,
            starts_at,
            expires_at
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        const transformedProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          originalPrice: data.original_price || undefined,
          rating: data.rating || 0,
          reviewCount: data.review_count || 0,
          image: data.image,
          category: data.category as 'wigs' | 'bundles' | 'closures' | 'frontals',
          subcategory: data.subcategory || undefined,
          isNew: data.is_new || false,
          isBestSeller: data.is_best_seller || false,
          colors: data.colors || [],
          lengths: data.lengths || [],
          size: data.size || [],
          description: data.description || undefined,
          features: data.features || [],
          hairType: data.hair_type || undefined,
          texture: data.texture || undefined,
          imageGallery: data.image_gallery || [],
          hairCareInstructions: data.hair_care_instructions || undefined,
          type: data.type || undefined,
          liveVideoUrl: data.live_video_url || undefined,
        };

        setProduct(transformedProduct);
        
        // Set default selections
        if (transformedProduct.colors.length > 0) {
          setSelectedColor(transformedProduct.colors[0]);
        }
        if (transformedProduct.lengths.length > 0) {
          setSelectedLength(transformedProduct.lengths[0]);
        }
        if (transformedProduct.size && transformedProduct.size.length > 0) {
          setSelectedSize(transformedProduct.size[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedColor,
      selectedLength,
      selectedSize,
      quantity
    };

    addToCart(cartItem);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast({
        title: 'Removed from favorites',
        description: `${product.name} has been removed from your favorites.`,
      });
    } else {
      addToFavorites(product);
      toast({
        title: 'Added to favorites',
        description: `${product.name} has been added to your favorites.`,
      });
    }
  };

  const nextImage = () => {
    if (!product) return;
    const totalImages = product.imageGallery.length || 1;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (!product) return;
    const totalImages = product.imageGallery.length || 1;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Button onClick={() => navigate('/shop')}>
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const currentImage = product.imageGallery.length > 0 
    ? product.imageGallery[currentImageIndex] 
    : product.image;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/shop')} className="hover:text-blush-600">
            Shop
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/shop?category=${product.category}`)}
            className="hover:text-blush-600 capitalize"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {product.imageGallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {product.isNew && (
                  <Badge className="bg-green-100 text-green-600">New</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-blush-100 text-blush-600">Best Seller</Badge>
                )}
              </div>

              {/* Live Video Button */}
              {product.liveVideoUrl && (
                <div className="absolute bottom-4 right-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(product.liveVideoUrl, '_blank')}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Live
                  </Button>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.imageGallery.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.imageGallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blush-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Length Selection */}
              {product.lengths.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <Select value={selectedLength} onValueChange={setSelectedLength}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.lengths.map((length) => (
                        <SelectItem key={length} value={length}>
                          {length}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Size Selection */}
              {product.size && product.size.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.size.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={`${
                  isFavorite(product.id) 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 text-blush-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-blush-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Quality Guarantee</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-blush-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">30-Day Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="care">Hair Care</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Product Information</h3>
                      <div className="space-y-3">
                        {product.hairType && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hair Type:</span>
                            <span className="font-medium">{product.hairType}</span>
                          </div>
                        )}
                        {product.texture && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Texture:</span>
                            <span className="font-medium">{product.texture}</span>
                          </div>
                        )}
                        {product.type && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium">{product.type}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium capitalize">{product.category}</span>
                        </div>
                      </div>
                    </div>

                    {product.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Sparkles className="w-4 h-4 text-blush-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="care" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Hair Care Instructions</h3>
                  {product.hairCareInstructions ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-600">{product.hairCareInstructions}</p>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <p>General hair care instructions:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Wash with sulfate-free shampoo</li>
                        <li>Use a wide-tooth comb when wet</li>
                        <li>Deep condition weekly</li>
                        <li>Avoid excessive heat styling</li>
                        <li>Store properly when not in use</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                  <div className="text-center text-gray-500 py-8">
                    <p>No reviews yet. Be the first to review this product!</p>
                    <Button className="mt-4 bg-blush-500 hover:bg-blush-600 text-white">
                      Write a Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
