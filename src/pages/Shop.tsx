import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Star,
  Heart,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  subcategory?: string;
  is_new: boolean;
  is_best_seller: boolean;
  colors?: string[];
  lengths?: string[];
  description?: string;
  hair_type?: string;
  texture?: string;
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedTexture, setSelectedTexture] = useState('all');
  const [selectedLength, setSelectedLength] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'wigs', label: 'Wigs' },
    { value: 'bundles', label: 'Bundles' },
    { value: 'closures', label: 'Closures' },
    { value: 'frontals', label: 'Frontals' },
  ];

  const textures = [
    { value: 'all', label: 'All Textures' },
    { value: 'straight', label: 'Straight' },
    { value: 'body_wave', label: 'Body Wave' },
    { value: 'deep_wave', label: 'Deep Wave' },
    { value: 'curly', label: 'Curly' },
    { value: 'loose_wave', label: 'Loose Wave' },
    { value: 'water_wave', label: 'Water Wave' },
  ];

  const lengths = [
    { value: 'all', label: 'All Lengths' },
    { value: '12', label: '12"' },
    { value: '14', label: '14"' },
    { value: '16', label: '16"' },
    { value: '18', label: '18"' },
    { value: '20', label: '20"' },
    { value: '22', label: '22"' },
    { value: '24', label: '24"' },
    { value: '26', label: '26"' },
  ];

  const priceRanges = [
    { value: [0, 50], label: '$0 - $50' },
    { value: [50, 100], label: '$50 - $100' },
    { value: [100, 200], label: '$100 - $200' },
    { value: [200, 500], label: '$200 - $500' },
    { value: [500, 1000], label: '$500+' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      const transformedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        rating: product.rating,
        reviews: product.review_count,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory,
        is_new: product.is_new,
        is_best_seller: product.is_best_seller,
        colors: product.colors,
        lengths: product.lengths,
        description: product.description,
        hair_type: product.hair_type,
        texture: product.texture
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedTexture !== 'all') {
      filtered = filtered.filter(product => product.texture === selectedTexture);
    }

    if (selectedLength !== 'all') {
      filtered = filtered.filter(product => product.lengths?.includes(selectedLength));
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (sortBy === 'price_asc') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedTexture, selectedLength, priceRange, sortBy]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newSearchParams = new URLSearchParams(searchParams);
    if (category !== 'all') {
      newSearchParams.set('category', category);
    } else {
      newSearchParams.delete('category');
    }
    setSearchParams(newSearchParams);
  };

  const handleTextureChange = (texture: string) => {
    setSelectedTexture(texture);
  };

  const handleLengthChange = (length: string) => {
    setSelectedLength(length);
  };

  const handlePriceRangeChange = (range: number[]) => {
    setPriceRange(range);
  };

  const handleSortByChange = (sortByOption: string) => {
    setSortBy(sortByOption);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newSearchParams = new URLSearchParams(searchParams);
    if (query) {
      newSearchParams.set('search', query);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onSearch={handleSearch} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rosegold-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span className="mx-2">/</span>
          <span>Shop</span>
        </div>

        {/* Shop Header */}
        <div className="md:flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop All</h2>
            <p className="text-gray-600">Explore our premium selection of wigs and hair extensions</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* View Mode */}
            <div>
              <Button 
                variant="outline" 
                size="icon"
                className={viewMode === 'grid' ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-50'}
                onClick={() => handleViewModeChange('grid')}
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className={viewMode === 'list' ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-50'}
                onClick={() => handleViewModeChange('list')}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Filter Button */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                  <DrawerDescription>
                    Adjust your search criteria
                  </DrawerDescription>
                </DrawerHeader>
                {/* Mobile Filters Content - Same as Desktop */}
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    {categories.map((category) => (
                      <div key={category.value} className="flex items-center">
                        <Input
                          type="radio"
                          id={`mobile-category-${category.value}`}
                          name="mobile-category"
                          value={category.value}
                          checked={selectedCategory === category.value}
                          onChange={() => handleCategoryChange(category.value)}
                          className="mr-2"
                        />
                        <label htmlFor={`mobile-category-${category.value}`}>{category.label}</label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Texture</h4>
                    {textures.map((texture) => (
                      <div key={texture.value} className="flex items-center">
                        <Input
                          type="radio"
                          id={`mobile-texture-${texture.value}`}
                          name="mobile-texture"
                          value={texture.value}
                          checked={selectedTexture === texture.value}
                          onChange={() => handleTextureChange(texture.value)}
                          className="mr-2"
                        />
                        <label htmlFor={`mobile-texture-${texture.value}`}>{texture.label}</label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Length</h4>
                    {lengths.map((length) => (
                      <div key={length.value} className="flex items-center">
                        <Input
                          type="radio"
                          id={`mobile-length-${length.value}`}
                          name="mobile-length"
                          value={length.value}
                          checked={selectedLength === length.value}
                          onChange={() => handleLengthChange(length.value)}
                          className="mr-2"
                        />
                        <label htmlFor={`mobile-length-${length.value}`}>{length.label}</label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Price Range</h4>
                    {priceRanges.map((range) => (
                      <div key={range.value[0]} className="flex items-center">
                        <Input
                          type="radio"
                          id={`mobile-price-${range.value[0]}`}
                          name="mobile-price"
                          value={range.value.toString()}
                          checked={priceRange[0] === range.value[0] && priceRange[1] === range.value[1]}
                          onChange={() => handlePriceRangeChange(range.value)}
                          className="mr-2"
                        />
                        <label htmlFor={`mobile-price-${range.value[0]}`}>{range.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Filters */}
        <div className="hidden md:block">
          <div className="border rounded-md p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2 text-gray-500" />
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Category</h4>
                {categories.map((category) => (
                  <div key={category.value} className="flex items-center">
                    <Input
                      type="radio"
                      id={`category-${category.value}`}
                      name="category"
                      value={category.value}
                      checked={selectedCategory === category.value}
                      onChange={() => handleCategoryChange(category.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`category-${category.value}`}>{category.label}</label>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Texture</h4>
                {textures.map((texture) => (
                  <div key={texture.value} className="flex items-center">
                    <Input
                      type="radio"
                      id={`texture-${texture.value}`}
                      name="texture"
                      value={texture.value}
                      checked={selectedTexture === texture.value}
                      onChange={() => handleTextureChange(texture.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`texture-${texture.value}`}>{texture.label}</label>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Length</h4>
                {lengths.map((length) => (
                  <div key={length.value} className="flex items-center">
                    <Input
                      type="radio"
                      id={`length-${length.value}`}
                      name="length"
                      value={length.value}
                      checked={selectedLength === length.value}
                      onChange={() => handleLengthChange(length.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`length-${length.value}`}>{length.label}</label>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Price Range</h4>
                {priceRanges.map((range) => (
                  <div key={range.value[0]} className="flex items-center">
                    <Input
                      type="radio"
                      id={`price-${range.value[0]}`}
                      name="price"
                      value={range.value.toString()}
                      checked={priceRange[0] === range.value[0] && priceRange[1] === range.value[1]}
                      onChange={() => handlePriceRangeChange(range.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`price-${range.value[0]}`}>{range.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid/List */}
        <div className="mt-8">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTexture('all');
                setSelectedLength('all');
                setPriceRange([0, 1000]);
              }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {filteredAndSortedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
