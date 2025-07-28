
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export interface FilterOptions {
  category: string;
  priceRange: [number, number];
  colors: string[];
  lengths: string[];
  hairTypes: string[];
  textures: string[];
  sortBy: 'name' | 'price' | 'rating' | 'newest';
  sortOrder: 'asc' | 'desc';
}

interface ProductFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  colors: string[];
  lengths: string[];
  hairTypes: string[];
  textures: string[];
  onSearch?: (query: string) => void;
}

const ProductFilter = ({ 
  filters, 
  onFilterChange, 
  categories, 
  colors, 
  lengths, 
  hairTypes, 
  textures,
  onSearch 
}: ProductFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const addToArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeFromArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    updateFilter(key, currentArray.filter(item => item !== value));
  };

  const clearAllFilters = () => {
    onFilterChange({
      category: '',
      priceRange: [0, 1000],
      colors: [],
      lengths: [],
      hairTypes: [],
      textures: [],
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.lengths.length > 0) count += filters.lengths.length;
    if (filters.hairTypes.length > 0) count += filters.hairTypes.length;
    if (filters.textures.length > 0) count += filters.textures.length;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Products</Label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            id="search"
            type="text"
            placeholder="Search by name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
          />
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <Label>Colors</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <Badge
              key={color}
              variant={filters.colors.includes(color) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => filters.colors.includes(color) ? removeFromArrayFilter('colors', color) : addToArrayFilter('colors', color)}
            >
              {color}
              {filters.colors.includes(color) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Lengths */}
      <div className="space-y-2">
        <Label>Lengths</Label>
        <div className="flex flex-wrap gap-2">
          {lengths.map(length => (
            <Badge
              key={length}
              variant={filters.lengths.includes(length) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => filters.lengths.includes(length) ? removeFromArrayFilter('lengths', length) : addToArrayFilter('lengths', length)}
            >
              {length}
              {filters.lengths.includes(length) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Hair Types */}
      <div className="space-y-2">
        <Label>Hair Types</Label>
        <div className="flex flex-wrap gap-2">
          {hairTypes.map(hairType => (
            <Badge
              key={hairType}
              variant={filters.hairTypes.includes(hairType) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => filters.hairTypes.includes(hairType) ? removeFromArrayFilter('hairTypes', hairType) : addToArrayFilter('hairTypes', hairType)}
            >
              {hairType}
              {filters.hairTypes.includes(hairType) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Textures */}
      <div className="space-y-2">
        <Label>Textures</Label>
        <div className="flex flex-wrap gap-2">
          {textures.map(texture => (
            <Badge
              key={texture}
              variant={filters.textures.includes(texture) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => filters.textures.includes(texture) ? removeFromArrayFilter('textures', texture) : addToArrayFilter('textures', texture)}
            >
              {texture}
              {filters.textures.includes(texture) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <div className="flex gap-2">
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearAllFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="w-full">
      {/* Mobile Filter */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters ({getActiveFiltersCount()})
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter */}
      <div className="hidden lg:block">
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
          </div>
          <FilterContent />
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
