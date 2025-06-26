
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, Share2, ArrowLeft, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProductById, getSimilarProducts } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = id ? getProductById(id) : null;
  const similarProducts = id ? getSimilarProducts(id) : [];
  
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
  const [selectedLength, setSelectedLength] = useState(product?.lengths?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
            <div className="aspect-square bg-gradient-to-br from-blush-100 to-cream-100 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blush-300 to-rosegold-300 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {product.name.charAt(0)}
                  </span>
                </div>
                <p className="text-blush-600 font-medium text-lg">
                  {product.name}
                </p>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-blush-50 to-cream-50 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.isNew && (
                  <Badge className="bg-green-500 text-white">New</Badge>
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
              <span className="text-3xl font-bold text-blush-600">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
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
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="px-4"
                >
                  <Heart 
                    size={20} 
                    className={isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'} 
                  />
                </Button>
                
                <Button variant="outline" className="px-4">
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
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium text-blush-600">Washing:</h4>
                      <p className="text-gray-600">Wash with cold water and sulfate-free shampoo. Condition regularly.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blush-600">Styling:</h4>
                      <p className="text-gray-600">Use heat protectant before styling. Keep heat settings below 350°F.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blush-600">Storage:</h4>
                      <p className="text-gray-600">Store on a wig stand or mannequin head when not in use.</p>
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
