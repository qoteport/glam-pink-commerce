import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  ArrowLeft,
  Plus,
  Minus,
  Expand,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import PriceDisplay from "@/components/PriceDisplay";
import PaystackPayment from "@/components/PaystackPayment";
import WriteReviewDialog from "@/components/WriteReviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
  is_verified_purchase: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(
    null
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchReviews(id);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories!fk_products_category (name, slug),
          subcategories!subcategory_id (name, slug),
          discounts!discount_id (name, type, value)
        `
        )
        .eq("id", productId)
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
        size: data.size,
        imageGallery: data.image_gallery || [],
        hairCareInstructions: data.hair_care_instructions,
        type: data.type,
        liveVideoUrl: data.live_video_url,
      };

      setProduct(transformedProduct);
      setSelectedColor(transformedProduct.colors?.[0] || "");
      setSelectedLength(transformedProduct.lengths?.[0] || "");
      setSelectedSize(transformedProduct.size?.[0] || "");

      fetchSimilarProducts(data.category);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .neq("id", id)
        .limit(4);

      if (error) throw error;

      const transformedProducts =
        data?.map((product) => ({
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
          lengths: product.lengths || [],
        })) || [];

      setSimilarProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching similar products:", error);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, customer_name, rating, title, comment, created_at, is_verified_purchase")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleMediaSelect = (index: number) => {
    if (playingVideoIndex === index) {
      setPlayingVideoIndex(null);
      return;
    }

    setSelectedMediaIndex(index);

    if (mediaItems[index].type === "video") {
      setPlayingVideoIndex(index);
    } else {
      setPlayingVideoIndex(null);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedLength);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handlePaystackSuccess = (reference: string) => {
    toast({
      title: "Payment Successful",
      description: `Payment completed! Reference: ${reference}`,
    });
    navigate("/");
  };

  const handlePaystackError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
         <div className="mb-[100px]">
        <Header />
      </div>
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
         <div className="mb-[100px]">
        <Header />
      </div>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h1>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Create media array with main image + video (if exists) + gallery images
  const mediaItems = [];

  if (product.liveVideoUrl) {
    mediaItems.push({
      type: "video",
      url: product.liveVideoUrl,
      alt: `${product.name} video`,
    });
  }

  if (product.imageGallery?.length > 0) {
    mediaItems.push(
      ...product.imageGallery.map((url, index) => ({
        type: "image",
        url,
        alt: `${product.name} ${index + 1}`,
      }))
    );
  }

  return (
    <div className="min-h-screen bg-white">
       <div className="mb-[100px]">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate("/")}
              className="hover:text-blush-500"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => navigate("/shop")}
              className="hover:text-blush-500"
            >
              Shop
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/shop?category=${product.category}`)}
              className="hover:text-blush-500 capitalize"
            >
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
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-gray-50 min-h-[100px]">
              {mediaItems[selectedMediaIndex]?.type === "video" ? (
                // Video player - plays inline
                <div className="w-full h-[400px] bg-black">
                  <iframe
                    src={`${mediaItems[selectedMediaIndex].url}?autoplay=0&mute=0`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                // Image with dialog for zoom
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="w-full h-[400px] cursor-pointer relative group">
                      <img
                        src={
                          mediaItems[selectedMediaIndex]?.url || product.image
                        }
                        alt={
                          mediaItems[selectedMediaIndex]?.alt || product.name
                        }
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Expand
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          size={32}
                        />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-[95vw] sm:max-w-6xl p-0 w-full h-[60vh] sm:h-[80vh] flex items-center justify-center"
                    ref={dialogRef}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={
                          mediaItems[selectedMediaIndex]?.url || product.image
                        }
                        alt={
                          mediaItems[selectedMediaIndex]?.alt || product.name
                        }
                        className="max-w-full max-h-full object-contain"
                        loading="eager"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3">
              {mediaItems.slice(0, 5).map((media, index) => (
                <button
                  key={index}
                  onClick={() => handleMediaSelect(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                    selectedMediaIndex === index
                      ? "border-primary scale-105 shadow-md"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  {media.type === "video" ? (
                    <>
                      <img
                        src={product.image}
                        alt={media.alt}
                        className="w-full h-full object-cover brightness-75"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 text-white"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      {playingVideoIndex === index && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4 text-primary"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
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

          <div className="space-y-3">
            <div className="space-y-1 md:space-y-2">
              <div className="flex flex-wrap gap-2">
                {product.isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    New Arrival
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-rosegold-500 hover:bg-rosegold-600 text-white">
                    Best Seller
                  </Badge>
                )}
              </div>

              <h1 className="text-xl md:text-xl md:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {product.rating > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              className="py-1"
            />

            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {product.features?.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Key Features:
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <svg
                        className="w-4 h-4 text-blush-500 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-5">
              {product.colors?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Color: <span className="font-normal">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === color
                            ? "border-primary scale-110 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-row gap-10">
                {product.lengths?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">
                      Length:{" "}
                      <span className="font-normal">{selectedLength}"</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.lengths.map((length, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedLength(length)}
                          className={`px-4 py-2 rounded-md border transition-all ${
                            selectedLength === length
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {length}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.size?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">
                      Size: <span className="font-normal">{selectedSize}"</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.size.map((size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-md border transition-all ${
                            selectedSize === size
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {size}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
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
                  onClick={() =>
                    isFavorite(product.id)
                      ? removeFromFavorites(product.id)
                      : addToFavorites(product.id)
                  }
                >
                  <Heart
                    size={20}
                    className={
                      isFavorite(product.id) ? "text-red-500 fill-current" : ""
                    }
                  />
                </Button>
              </div>

              {user && (
                <PaystackPayment
                  amount={product.price * quantity}
                  currency="GHS"
                  customerEmail={user.email}
                  customerName={user.user_metadata?.full_name || user.email}
                  onSuccess={handlePaystackSuccess}
                  onError={handlePaystackError}
                  className="w-full h-12 border-primary text-white hover:text-primary hover:bg-primary/10"
                  metadata={{
                    product_id: product.id,
                    product_name: product.name,
                    quantity,
                    selected_color: selectedColor,
                    selected_length: selectedLength,
                    selected_size: selectedSize,
                  }}
                >
                  Buy Now - Express Checkout
                </PaystackPayment>
              )}

              {!user && (
                <Button
                  variant="outline"
                  className="w-full h-12 border-primary text-primary hover:bg-primary/10"
                  onClick={() => navigate("/auth")}
                >
                  Sign in to Buy Now
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out this amazing ${product.name}!`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied!",
                      description: "Product link has been copied to clipboard",
                    });
                  }
                }}
              >
                <Share2 size={16} className="mr-2" />
                Share this product
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Truck className="w-6 h-6 text-blush-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Free Shipping Available</p>
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

        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full bg-gray-100 rounded-lg p-1 h-auto flex flex-wrap justify-start lg:justify-center lg:space-x-2">
              <TabsTrigger
                value="details"
                className="py-2 px-3 text-sm sm:text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Product Details
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="py-2 px-3 text-sm sm:text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="care"
                className="py-2 px-3 text-sm sm:text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Hair Care Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">
                        Product Specifications
                      </h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-gray-600">Hair Type:</dt>
                          <dd className="font-medium text-gray-900">
                            {product.hairType}
                          </dd>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-gray-600">Category:</dt>
                          <dd className="font-medium text-gray-900 capitalize">
                            {product.category}
                          </dd>
                        </div>
                        {product.subcategory && (
                          <div className="flex justify-between py-2 border-b">
                            <dt className="text-gray-600">Type:</dt>
                            <dd className="font-medium text-gray-900">
                              {product.subcategory}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Star className="text-primary" size={24} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        Customer Reviews
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Be the first to review this product and help others make
                        their decision!
                      </p>
                      <WriteReviewDialog 
                        productId={product.id} 
                        productName={product.name}
                        onReviewSubmitted={() => fetchReviews(product.id)}
                      >
                        <Button className="mt-6">Write a Review</Button>
                      </WriteReviewDialog>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Customer Reviews ({reviews.length})
                        </h3>
                        <WriteReviewDialog 
                          productId={product.id} 
                          productName={product.name}
                          onReviewSubmitted={() => fetchReviews(product.id)}
                        >
                          <Button>Write a Review</Button>
                        </WriteReviewDialog>
                      </div>
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              {review.is_verified_purchase && (
                                <Badge variant="outline" className="text-xs">Verified</Badge>
                              )}
                            </div>
                            {review.title && <h4 className="font-semibold">{review.title}</h4>}
                            <p className="text-gray-700 mt-1">{review.comment}</p>
                            <div className="text-sm text-gray-500 mt-2">
                              {review.customer_name} • {format(new Date(review.created_at), "MMM d, yyyy")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="care" className="mt-6">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">
                        Hair Care Instructions
                      </h3>
                      {product.hairCareInstructions && (
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <p className="whitespace-pre-wrap">
                            {product.hairCareInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
