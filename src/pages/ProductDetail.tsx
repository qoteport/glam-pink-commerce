import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Star, Heart, ShoppingCart, Share2, ArrowLeft, Plus, Minus, Expand } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0); // 0 = main image

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!fk_products_category (name, slug),
          subcategories!subcategory_id (name, slug),
          discounts!discount_id (name, type, value)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      const transformedProduct = {
        id: data.id,
        name: data.name,
        price: data.price,
        originalPrice: data.original_price,
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        image: data.image,
        category: data.category,
        subcategory: data.subcategory,
        isNew: data.is_new,
        isBestSeller: data.is_best_seller,
        colors: data.colors || [],
        lengths: data.lengths || [],
        description: data.description,
        features: data.features || [],
        hairType: data.hair_type,
        texture: data.texture,
        imageGallery: data.image_gallery || [],
        hairCareInstructions: data.hair_care_instructions,
        type: data.type,
        liveVideoUrl: data.live_video_url
      };

      setProduct(transformedProduct);
      setSelectedColor(transformedProduct.colors?.[0] || '');
      setSelectedLength(transformedProduct.lengths?.[0] || '');
      setSelectedSize(transformedProduct.size?.[0] || '');
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          <Button onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedLength);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  // Create media array with main image + video (if exists) + gallery images
  const mediaItems = [
    { type: 'image', url: product.image, alt: product.name }
  ];
  
  if (product.liveVideoUrl) {
    mediaItems.push({ type: 'video', url: product.liveVideoUrl, alt: `${product.name} video` });
  }
  
  if (product.imageGallery?.length > 0) {
    mediaItems.push(...product.imageGallery.map((url, index) => ({
      type: 'image',
      url,
      alt: `${product.name} ${index + 1}`
    })));
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb and Back Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-blush-500">
              Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/shop')} className="hover:text-blush-500">
              Shop
            </button>
            <span>/</span>
            <button onClick={() => navigate(`/shop?category=${product.category}`)} className="hover:text-blush-500 capitalize">
              {product.category}
            </button>
            <span>/</span>
            <span className="text-gray-800">{product.name}</span>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="hidden sm:flex"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Media Section - Images and Video */}
          <div className="space-y-4">
            {/* Main Image or Video Display */}
            <div className="relative rounded-xl overflow-hidden bg-gray-50">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="aspect-square w-full cursor-pointer relative group">
                    {mediaItems[selectedMediaIndex].type === 'video' ? (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white ml-1">
                              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <img
                          src={product.image}
                          alt={mediaItems[selectedMediaIndex].alt}
                          className="w-full h-full object-cover opacity-70"
                        />
                      </div>
                    ) : (
                      <img
                        src={mediaItems[selectedMediaIndex].url}
                        alt={mediaItems[selectedMediaIndex].alt}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0">
                  <div className="aspect-square">
                    {mediaItems[selectedMediaIndex].type === 'video' ? (
                      <iframe 
                        src={mediaItems[selectedMediaIndex].url}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <img
                        src={mediaItems[selectedMediaIndex].url}
                        alt={mediaItems[selectedMediaIndex].alt}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Media Thumbnail Grid */}
            <div className="grid grid-cols-5 gap-2">
              {mediaItems.slice(0, 5).map((media, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                    selectedMediaIndex === index 
                      ? 'border-primary scale-105 shadow-md' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  {media.type === 'video' ? (
                    <>
                      <img
                        src={product.image}
                        alt={media.alt}
                        className="w-full h-full object-cover brightness-75"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <img
                      src={media.url}
                      alt={media.alt}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

         {/* Product Info Section */}
          <div className="space-y-6">
            {/* Title and Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {product.isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">New Arrival</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-rosegold-500 hover:bg-rosegold-600 text-white">Best Seller</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white">-{discountPercentage}% OFF</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4 py-2">
              <span className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">Key Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blush-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variants */}
            <div className="space-y-5">
              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Color: <span className="font-normal">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === color 
                            ? 'border-primary scale-110 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Length Selection */}
              {product.lengths?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Length: <span className="font-normal">{selectedLength}"</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {product.lengths.map((length, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedLength(length)}
                        className={`px-4 py-2 rounded-md border transition-all ${
                          selectedLength === length 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {length}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.size?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Size: <span className="font-normal">{selectedSize}"</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-md border transition-all ${
                          selectedSize === size 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Quantity</h3>
                <div className="flex items-center space-x-3 w-fit border rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-3 h-12"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => isFavorite(product.id) ? removeFromFavorites(product.id) : addToFavorites(product.id)}
                >
                  <Heart 
                    size={20} 
                    className={isFavorite(product.id) ? 'text-red-500 fill-current' : ''} 
                  />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full h-12 border-primary text-primary hover:bg-primary/10"
              >
                Buy Now - Express Checkout
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out this amazing ${product.name}!`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: 'Link copied!',
                      description: 'Product link has been copied to clipboard',
                    });
                  }
                }}
              >
                <Share2 size={16} className="mr-2" />
                Share this product
              </Button>
            </div>

            {/* Product Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free shipping over $75</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>30-day returns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>100% Virgin Hair</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full bg-gray-100 rounded-lg p-1 h-auto">
              <TabsTrigger 
                value="details" 
                className="py-2 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Product Details
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="py-2 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Customer Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="care" 
                className="py-2 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Hair Care Guide
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">Product Specifications</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-gray-600">Hair Type:</dt>
                          <dd className="font-medium text-gray-900">{product.hairType}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-gray-600">Category:</dt>
                          <dd className="font-medium text-gray-900 capitalize">{product.category}</dd>
                        </div>
                        {product.subcategory && (
                          <div className="flex justify-between py-2 border-b">
                            <dt className="text-gray-600">Type:</dt>
                            <dd className="font-medium text-gray-900">{product.subcategory}</dd>
                          </div>
                        )}
                        {product.texture && (
                          <div className="flex justify-between py-2 border-b">
                            <dt className="text-gray-600">Texture:</dt>
                            <dd className="font-medium text-gray-900">{product.texture}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">What's Included</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start py-2 border-b">
                          <svg className="w-5 h-5 text-blush-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>1x {product.name}</span>
                        </li>
                        <li className="flex items-start py-2 border-b">
                          <svg className="w-5 h-5 text-blush-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Care instruction card</span>
                        </li>
                        <li className="flex items-start py-2 border-b">
                          <svg className="w-5 h-5 text-blush-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Protective packaging</span>
                        </li>
                        <li className="flex items-start py-2">
                          <svg className="w-5 h-5 text-blush-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Quality guarantee certificate</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Star className="text-primary" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Customer Reviews</h3>
                    <p className="text-gray-600 max-w-md mx-auto">Be the first to review this product and help others make their decision!</p>
                    <Button className="mt-6">Write a Review</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="care" className="mt-6">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">Hair Care Instructions</h3>
                      {product.hairCareInstructions ? (
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <p className="whitespace-pre-wrap">{product.hairCareInstructions}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-primary mb-2">Washing:</h4>
                            <p className="text-gray-700">Wash with cold water and sulfate-free shampoo. Condition regularly.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-primary mb-2">Styling:</h4>
                            <p className="text-gray-700">Use heat protectant before styling. Keep heat settings below 350°F.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-primary mb-2">Storage:</h4>
                            <p className="text-gray-700">Store on a wig stand or mannequin head when not in use.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;