
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '@/components/shop/ProductGrid';
import ProductFilter from '@/components/shop/ProductFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedLength, setSelectedLength] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedTexture, setSelectedTexture] = useState<string>('all');
  const [selectedHairType, setSelectedHairType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    products,
    selectedCategory,
    selectedPriceRange,
    selectedLength,
    selectedColor,
    selectedTexture,
    selectedHairType,
    sortBy
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          hair_types (
            name
          )
        `);

      if (error) throw error;

      const transformedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price || undefined,
        rating: product.rating || 0,
        reviewCount: product.review_count || 0,
        image: product.image,
        category: product.category as 'wigs' | 'bundles' | 'closures' | 'frontals',
        subcategory: product.subcategory || undefined,
        isNew: product.is_new || false,
        isBestSeller: product.is_best_seller || false,
        colors: product.colors || [],
        lengths: product.lengths || [],
        size: product.size || [],
        description: product.description || undefined,
        features: product.features || [],
        hairType: product.hair_types?.name || product.hair_type || undefined,
        texture: product.texture || undefined,
        imageGallery: product.image_gallery || [],
        hairCareInstructions: product.hair_care_instructions || undefined,
        type: product.type || undefined,
        liveVideoUrl: product.live_video_url || undefined,
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const price = product.price;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Length filter
    if (selectedLength !== 'all') {
      filtered = filtered.filter(product => 
        product.lengths.includes(selectedLength)
      );
    }

    // Color filter
    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => 
        product.colors.includes(selectedColor)
      );
    }

    // Texture filter
    if (selectedTexture !== 'all') {
      filtered = filtered.filter(product => 
        product.texture === selectedTexture
      );
    }

    // Hair type filter
    if (selectedHairType !== 'all') {
      filtered = filtered.filter(product => 
        product.hairType === selectedHairType
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedLength('all');
    setSelectedColor('all');
    setSelectedTexture('all');
    setSelectedHairType('all');
    setSortBy('featured');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (selectedLength !== 'all') count++;
    if (selectedColor !== 'all') count++;
    if (selectedTexture !== 'all') count++;
    if (selectedHairType !== 'all') count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Products' : 
                 selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowMobileFilter(true)}
              className="md:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-2 bg-blush-600 text-white">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategory !== 'all' && (
                <Badge variant="outline" className="bg-blush-50 text-blush-600 border-blush-200">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-blush-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedPriceRange !== 'all' && (
                <Badge variant="outline" className="bg-blush-50 text-blush-600 border-blush-200">
                  Price: ${selectedPriceRange.replace('-', ' - $')}
                  <button
                    onClick={() => setSelectedPriceRange('all')}
                    className="ml-1 hover:text-blush-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {/* Add other active filter badges here */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blush-600 hover:text-blush-800"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <ProductFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPriceRange={selectedPriceRange}
              setSelectedPriceRange={setSelectedPriceRange}
              selectedLength={selectedLength}
              setSelectedLength={setSelectedLength}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedTexture={selectedTexture}
              setSelectedTexture={setSelectedTexture}
              selectedHairType={selectedHairType}
              setSelectedHairType={setSelectedHairType}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Mobile Filter Overlay */}
          {showMobileFilter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileFilter(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <ProductFilter
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedPriceRange={selectedPriceRange}
                    setSelectedPriceRange={setSelectedPriceRange}
                    selectedLength={selectedLength}
                    setSelectedLength={setSelectedLength}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    selectedTexture={selectedTexture}
                    setSelectedTexture={setSelectedTexture}
                    selectedHairType={selectedHairType}
                    setSelectedHairType={setSelectedHairType}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onClearFilters={clearFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid 
              products={filteredProducts} 
              loading={loading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
