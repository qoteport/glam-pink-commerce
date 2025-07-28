import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Star, 
  ShoppingCart, 
  ArrowLeft, 
  Truck, 
  Shield, 
  RotateCcw,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedLength, setSelectedLength] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            discounts (
              name,
              type,
              value,
              code,
              is_active,
              starts_at,
              expires_at
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          return;
        }

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
          if (transformedProduct.colors && transformedProduct.colors.length > 0) {
            setSelectedColor(transformedProduct.colors[0]);
          }
          if (transformedProduct.lengths && transformedProduct.lengths.length > 0) {
            setSelectedLength(transformedProduct.lengths[0]);
          }
          if (transformedProduct.size && transformedProduct.size.length > 0) {
            setSelectedSize(transformedProduct.size[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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
      quantity: 1
    };

    addToCart(cartItem);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast({
        title: 'Removed from Favorites',
        description: `${product.name} has been removed from your favorites.`,
      });
    } else {
      addToFavorites(product);
      toast({
        title: 'Added to Favorites',
        description: `${product.name} has been added to your favorites.`,
      });
    }
  };

  const nextImage = () => {
    if (product?.imageGallery) {
      setCurrentImageIndex((prev) => 
        prev === product.imageGallery!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.imageGallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.imageGallery!.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blush-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/shop')}>
            Back to Shop
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = product.imageGallery && product.imageGallery.length > 0 
    ? product.imageGallery 
    : [product.image];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/shop')}
            className="p-0 h-auto text-blush-600 hover:text-blush-700"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Shop
          </Button>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 group">
              <img
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {product.isNew && (
                  <Badge className="bg-green-500 text-white">New</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-rosegold-500 text-white">Best Seller</Badge>
                )}
              </div>

              {/* Live Video Play Button */}
              {product.liveVideoUrl && (
                <button
                  onClick={() => window.open(product.liveVideoUrl, '_blank')}
                  className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white p-3 rounded-full transition-colors"
                >
                  <Play size={20} className="ml-1" />
                </button>
              )}
            </div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex 
                        ? 'border-blush-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
              
              {/* Price */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-blush-600">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
              </div>

              {/* Category & Type */}
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="outline" className="capitalize">{product.category}</Badge>
                {product.subcategory && (
                  <Badge variant="outline" className="capitalize">{product.subcategory}</Badge>
                )}
                {product.type && (
                  <Badge variant="outline">{product.type}</Badge>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          selectedColor === color
                            ? 'border-blush-500 bg-blush-50 text-blush-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lengths */}
              {product.lengths && product.lengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Length</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.lengths.map((length) => (
                      <button
                        key={length}
                        onClick={() => setSelectedLength(length)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          selectedLength === length
                            ? 'border-blush-500 bg-blush-50 text-blush-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {length}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.size && product.size.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          selectedSize === size
                            ? 'border-blush-500 bg-blush-50 text-blush-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-blush-600 hover:bg-blush-700 text-white"
              >
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={`${
                  isFavorite(product.id) 
                    ? 'text-red-500 border-red-500 hover:bg-red-50' 
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart size={20} className={isFavorite(product.id) ? 'fill-current' : ''} />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Truck size={16} className="text-blush-600" />
                <span className="text-sm text-gray-600">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-blush-600" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw size={16} className="text-blush-600" />
                <span className="text-sm text-gray-600">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="care">Hair Care</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {product.description || 'This premium hair product offers exceptional quality and style.'}
                    </p>
                    
                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blush-600 mt-1">•</span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium capitalize">{product.category}</span>
                        </div>
                        {product.subcategory && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subcategory:</span>
                            <span className="font-medium capitalize">{product.subcategory}</span>
                          </div>
                        )}
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
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Options</h3>
                      <div className="space-y-3">
                        {product.colors && product.colors.length > 0 && (
                          <div>
                            <span className="text-gray-600 block mb-1">Colors:</span>
                            <div className="flex flex-wrap gap-1">
                              {product.colors.map((color, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {color}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.lengths && product.lengths.length > 0 && (
                          <div>
                            <span className="text-gray-600 block mb-1">Lengths:</span>
                            <div className="flex flex-wrap gap-1">
                              {product.lengths.map((length, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {length}"
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.size && product.size.length > 0 && (
                          <div>
                            <span className="text-gray-600 block mb-1">Sizes:</span>
                            <div className="flex flex-wrap gap-1">
                              {product.size.map((size, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {size}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="care" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Hair Care Instructions</h3>
                    <div className="text-gray-700 leading-relaxed">
                      {product.hairCareInstructions ? (
                        <p>{product.hairCareInstructions}</p>
                      ) : (
                        <div>
                          <p className="mb-4">Follow these general care instructions to maintain your hair's quality:</p>
                          <ul className="space-y-2">
                            <li className="flex items-start space-x-2">
                              <span className="text-blush-600 mt-1">•</span>
                              <span>Wash with sulfate-free shampoo and conditioner</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blush-600 mt-1">•</span>
                              <span>Use heat protectant before styling</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blush-600 mt-1">•</span>
                              <span>Avoid excessive heat and chemical processing</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blush-600 mt-1">•</span>
                              <span>Store properly when not in use</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
