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
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedTexture, setSelectedTexture] = useState('all');
  const [selectedLength, setSelectedLength] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' }
  ]);

  const textures = [
    { value: 'all', label: 'All Textures' },
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
    fetchCategories();
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
          discounts!discount_id (name, type, value)
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
        hairType: product.hair_type,
        texture: product.texture,
        imageGallery: product.image_gallery || [],
        hairCareInstructions: product.hair_care_instructions,
        type: product.type,
        liveVideoUrl: product.live_video_url
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      const dbCategories = data?.map(cat => ({
        value: cat.slug,
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
              textures={textures}
              lengths={lengths}
              priceRanges={priceRanges}
              selectedCategory={selectedCategory}
              selectedTexture={selectedTexture}
              selectedLength={selectedLength}
              priceRange={priceRange}
              onCategoryChange={handleCategoryChange}
              onTextureChange={setSelectedTexture}
              onLengthChange={setSelectedLength}
              onPriceRangeChange={setPriceRange}
              onClearFilters={() => {
                setSelectedCategory('all');
                setSelectedTexture('all');
                setSelectedLength('all');
                setPriceRange([0, 1000]);
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