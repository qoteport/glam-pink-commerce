
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
  const [quantity, setQuantity] = useState(1);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1); // -1 for main image

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!category_id (name, slug),
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

      // Fetch similar products
      // fetchSimilarProducts(data.category);
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

  const fetchSimilarProducts = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', id)
        .limit(4);

      if (error) throw error;

      const transformedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price,
        rating: product.rating || 0,
        reviewCount: product.review_count || 0,
        image: product.image_gallery?.[0] || product.image,
        category: product.category,
        subcategory: product.subcategory,
        isNew: product.is_new,
        isBestSeller: product.is_best_seller,
        colors: product.colors || [],
        lengths: product.lengths || []
      })) || [];

      setSimilarProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching similar products:', error);
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
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
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

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="aspect-square bg-gradient-to-br from-muted/20 to-muted/40 rounded-2xl overflow-hidden cursor-pointer relative group">
                  {product.image || (product.imageGallery && product.imageGallery.length > 0) ? (
                    <>
                      <img
                        src={
                          selectedImageIndex === -1 || selectedImageIndex === null
                            ? product.image
                            : (product.imageGallery && product.imageGallery[selectedImageIndex]) 
                              ? product.imageGallery[selectedImageIndex] 
                              : product.image
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/30 to-primary/50 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-4xl">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                        <p className="text-primary font-medium text-lg">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0">
                <div className="aspect-square">
                  <img
                    src={
                      selectedImageIndex === -1 || selectedImageIndex === null
                        ? product.image
                        : (product.imageGallery && product.imageGallery[selectedImageIndex]) 
                          ? product.imageGallery[selectedImageIndex] 
                          : product.image
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Image Gallery Grid */}
            {product.imageGallery && product.imageGallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {/* Always show main image first */}
                <button
                  onClick={() => setSelectedImageIndex(-1)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === -1 
                      ? 'border-pink-400 scale-105' 
                      : 'border-transparent hover:border-pink-200'
                  }`}
                >
                  <img 
                    src={product.image} 
                    alt={`${product.name} main`} 
                    className="w-full h-full object-cover" 
                  />
                </button>
                {/* Gallery images */}
                {product.imageGallery.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-pink-400 scale-105' 
                        : 'border-transparent hover:border-pink-200'
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.isNew && (
                  <Badge className="bg-green-500 text-white">Ready to Ship</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-rosegold-500 text-white">Best Seller</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 text-white">-{discountPercentage}% OFF</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            {product.features && (
              <div>
                <h3 className="font-semibold mb-2">Key Features:</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blush-400 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && (
              <div>
                <h3 className="font-semibold mb-3">Color: {selectedColor}</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-blush-500 scale-110' 
                          : 'border-gray-200 hover:border-blush-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Length Selection */}
            {product.lengths && (
              <div>
                <h3 className="font-semibold mb-3">Length: {selectedLength}"</h3>
                <div className="flex flex-wrap gap-2">
                  {product.lengths.map((length, index) => (
                    <Badge
                      key={index}
                      variant={selectedLength === length ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedLength(length)}
                    >
                      {length}"
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-blush-500 to-rosegold-500 hover:from-blush-600 hover:to-rosegold-600 text-white font-semibold py-3"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => isFavorite(product.id) ? removeFromFavorites(product.id) : addToFavorites(product.id)}
                  className="px-4"
                >
                  <Heart 
                    size={20} 
                    className={isFavorite(product.id) ? 'text-red-500 fill-current' : ''} 
                  />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="px-4"
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
                  <Share2 size={20} className="text-gray-600" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-blush-300 text-blush-600 hover:bg-blush-50"
              >
                Buy Now - Express Checkout
              </Button>
            </div>

            {/* Product Info */}
            <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
              <p>🚚 Free shipping on orders over $75</p>
              <p>↩️ 30-day return policy</p>
              <p>💎 100% Virgin Hair Guarantee</p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="care">Hair Care</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Product Specifications</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Hair Type:</dt>
                          <dd className="font-medium">{product.hairType}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Texture:</dt>
                          <dd className="font-medium">{product.texture}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Category:</dt>
                          <dd className="font-medium capitalize">{product.category}</dd>
                        </div>
                        {product.subcategory && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Type:</dt>
                            <dd className="font-medium">{product.subcategory}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">What's Included</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• 1x {product.name}</li>
                        <li>• Care instruction card</li>
                        <li>• Protective packaging</li>
                        <li>• Quality guarantee certificate</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
                    <p className="text-gray-600">Reviews feature coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="care" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Hair Care Instructions</h3>
                  {product.hairCareInstructions ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap">{product.hairCareInstructions}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-medium text-primary">Washing:</h4>
                        <p className="text-muted-foreground">Wash with cold water and sulfate-free shampoo. Condition regularly.</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Styling:</h4>
                        <p className="text-muted-foreground">Use heat protectant before styling. Keep heat settings below 350°F.</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Storage:</h4>
                        <p className="text-muted-foreground">Store on a wig stand or mannequin head when not in use.</p>
                      </div>
                    </div>
                  )}
                  
                  {product.liveVideoUrl && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Live Demonstration</h4>
                      <a 
                        href={product.liveVideoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Watch Live Video Tutorial →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Similar Products</h2>
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
