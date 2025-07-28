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
import ProductFilter from '@/components/shop/ProductFilter';
import ProductGrid from '@/components/shop/ProductGrid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/data/products';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedProductStatus, setProductStatus] = useState(searchParams.get('status') || null);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedLength, setSelectedLength] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedHairType, setSelectedHairType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' }
  ]);
  
  const [colors, setColors] = useState([{ value: 'all', label: 'All Colors' }]);
  const [lengths, setLengths] = useState([{ value: 'all', label: 'All Lengths' }]);
  const [sizes, setSizes] = useState([{ value: 'all', label: 'All Sizes' }]);
  const [hairTypes, setHairTypes] = useState([{ value: 'all', label: 'All Hair Types' }]);
  const [priceRanges, setPriceRanges] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchHairTypes();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!category_id (name, slug),
          subcategories!subcategory_id (name, slug),
          discounts!discount_id (name, type, value),
          hair_types!hair_type_id (id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price,
        rating: product.rating || 0,
        reviewCount: product.review_count || 0,
        image: product.image_gallery?.[0] || product.image,
        category: product.category as 'wigs' | 'bundles' | 'closures' | 'frontals',
        subcategory: product.subcategory,
        isNew: product.is_new,
        isBestSeller: product.is_best_seller,
        colors: product.colors,
        lengths: product.lengths,
        description: product.description,
        features: product.features || [],
        hairType: product.hair_types?.name,
        hairTypeId: product.hair_type_id,
        sizes: product.size || [],
        imageGallery: product.image_gallery || [],
        hairCareInstructions: product.hair_care_instructions,
        type: product.type,
        liveVideoUrl: product.live_video_url
      })) || [];

      setProducts(transformedProducts);

      // Generate dynamic filter options
      const uniqueColors = [...new Set(transformedProducts.flatMap(p => p.colors || []))].map(color => ({
        value: color,
        label: color.startsWith('#') ? color : color.charAt(0).toUpperCase() + color.slice(1)
      }));
      
      const uniqueLengths = [...new Set(transformedProducts.flatMap(p => p.lengths || []))].map(length => ({
        value: length,
        label: length
      }));

      const uniqueSizes = [...new Set(transformedProducts.flatMap(p => p.sizes || []))].map(size => ({
        value: size,
        label: size
      }));

      // Generate dynamic price ranges
      const prices = transformedProducts.map(p => p.price).filter(p => p != null);
      const minPrice = Math.floor(Math.min(...prices) / 10) * 10;
      const maxPrice = Math.ceil(Math.max(...prices) / 10) * 10;
      const rangeStep = Math.ceil((maxPrice - minPrice) / 5);
      const dynamicPriceRanges = [];
      for (let i = minPrice; i < maxPrice; i += rangeStep) {
        const rangeEnd = Math.min(i + rangeStep, maxPrice);
        dynamicPriceRanges.push({
          value: [i, rangeEnd],
          label: `$${i} - $${rangeEnd}`
        });
      }
      dynamicPriceRanges.push({
        value: [maxPrice, Infinity],
        label: `$${maxPrice}+`
      });

      setColors([{ value: 'all', label: 'All Colors' }, ...uniqueColors]);
      setLengths([{ value: 'all', label: 'All Lengths' }, ...uniqueLengths]);
      setSizes([{ value: 'all', label: 'All Sizes' }, ...uniqueSizes]);
      setPriceRanges(dynamicPriceRanges);
      setPriceRange([minPrice, maxPrice]);
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      const dbCategories = data?.map(cat => ({
        value: cat.name,
        label: cat.name
      })) || [];

      setCategories([
        { value: 'all', label: 'All Categories' },
        ...dbCategories
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchHairTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('hair_types')
        .select('id, name')
        .order('name');

      if (error) throw error;

      const dbHairTypes = data?.map(hairType => ({
        value: hairType.name,
        label: hairType.name
      })) || [];

      setHairTypes([
        { value: 'all', label: 'All Hair Types' },
        ...dbHairTypes
      ]);
    } catch (error) {
      console.error('Error fetching hair types:', error);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (selectedProductStatus) {
      filtered = filtered.filter(product => product.isNew === (selectedProductStatus ? true : false));
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category.trim().toLowerCase().replace(/\s+/g, '-') === selectedCategory.trim().toLowerCase().replace(/\s+/g, '-'));
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => product.colors?.includes(selectedColor));
    }

    if (selectedLength !== 'all') {
      filtered = filtered.filter(product => product.lengths?.includes(selectedLength));
    }

    if (selectedSize !== 'all') {
      filtered = filtered.filter(product => product.size?.includes(selectedSize));
    }

    if (selectedHairType !== 'all') {
      filtered = filtered.filter(product => product.hairType === selectedHairType);
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
  }, [products, searchQuery, selectedCategory, selectedColor, selectedLength, selectedSize, selectedHairType, priceRange, sortBy]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ProductFilter
              categories={categories}
              colors={colors}
              lengths={lengths}
              sizes={sizes}
              hairTypes={hairTypes}
              priceRanges={priceRanges}
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              selectedLength={selectedLength}
              selectedSize={selectedSize}
              selectedHairType={selectedHairType}
              priceRange={priceRange}
              onCategoryChange={handleCategoryChange}
              onColorChange={setSelectedColor}
              onLengthChange={setSelectedLength}
              onSizeChange={setSelectedSize}
              onHairTypeChange={setSelectedHairType}
              onPriceRangeChange={setPriceRange}
              onClearFilters={() => {
                setSelectedCategory('all');
                setSelectedColor('all');
                setSelectedLength('all');
                setSelectedSize('all');
                setSelectedHairType('all');
                setPriceRange([0, 10000]);
                setProductStatus(null);
              }}
            />
          </div>

          <div className="flex-1">
            <ProductGrid
              products={filteredAndSortedProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              loading={loading}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;