import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products, Product, searchProducts, getProductsByCategory } from '@/data/products';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);
  const [selectedLengths, setSelectedLengths] = useState<string[]>([]);

  useEffect(() => {
    let result = [...products];
    
    // Apply search
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      result = searchProducts(searchQuery);
    }

    // Apply category filter
    const categoryFilter = searchParams.get('category');
    if (categoryFilter && !searchQuery) {
      result = getProductsByCategory(categoryFilter);
    }

    // Apply additional filters
    const filterParam = searchParams.get('filter');
    if (filterParam === 'new') {
      result = result.filter(p => p.isNew);
    } else if (filterParam === 'sale') {
      result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    // Apply local filters
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedTextures.length > 0) {
      result = result.filter(p => p.texture && selectedTextures.includes(p.texture));
    }

    if (selectedLengths.length > 0) {
      result = result.filter(p => p.lengths && p.lengths.some(l => selectedLengths.includes(l)));
    }

    // Apply price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // Featured - keep original order
        break;
    }

    setFilteredProducts(result);
  }, [searchParams, selectedCategories, selectedTextures, selectedLengths, priceRange, sortBy]);

  const handleSearch = (query: string) => {
    setSearchParams({ search: query });
  };

  const categories = ['wigs', 'bundles', 'closures', 'frontals'];
  const textures = ['Straight', 'Curly', 'Body Wave', 'Deep Wave', 'Loose Wave', 'Kinky Straight'];
  const lengths = ['12', '14', '16', '18', '20', '22', '24'];

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Shop Our Collection
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-gray-600">
              Showing {filteredProducts.length} products
            </p>
            
            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List size={16} />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden"
              >
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-80 space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <SlidersHorizontal size={20} className="text-blush-500" />
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    min={0}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                        />
                        <label htmlFor={category} className="text-sm capitalize cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Textures */}
                <div>
                  <h4 className="font-medium mb-3">Hair Texture</h4>
                  <div className="space-y-2">
                    {textures.map(texture => (
                      <div key={texture} className="flex items-center space-x-2">
                        <Checkbox
                          id={texture}
                          checked={selectedTextures.includes(texture)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTextures([...selectedTextures, texture]);
                            } else {
                              setSelectedTextures(selectedTextures.filter(t => t !== texture));
                            }
                          }}
                        />
                        <label htmlFor={texture} className="text-sm cursor-pointer">
                          {texture}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lengths */}
                <div>
                  <h4 className="font-medium mb-3">Length</h4>
                  <div className="flex flex-wrap gap-2">
                    {lengths.map(length => (
                      <Badge
                        key={length}
                        variant={selectedLengths.includes(length) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (selectedLengths.includes(length)) {
                            setSelectedLengths(selectedLengths.filter(l => l !== length));
                          } else {
                            setSelectedLengths([...selectedLengths, length]);
                          }
                        }}
                      >
                        {length}"
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedTextures([]);
                    setSelectedLengths([]);
                    setPriceRange([0, 500]);
                    setSearchParams({});
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
