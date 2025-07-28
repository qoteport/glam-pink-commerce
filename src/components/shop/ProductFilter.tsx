
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, X } from 'lucide-react';

interface ProductFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (range: string) => void;
  selectedLength: string;
  setSelectedLength: (length: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedTexture: string;
  setSelectedTexture: (texture: string) => void;
  selectedHairType: string;
  setSelectedHairType: (hairType: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  onClearFilters: () => void;
}

const ProductFilter = ({
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedLength,
  setSelectedLength,
  selectedColor,
  setSelectedColor,
  selectedTexture,
  setSelectedTexture,
  selectedHairType,
  setSelectedHairType,
  sortBy,
  setSortBy,
  onClearFilters,
}: ProductFilterProps) => {
  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedPriceRange !== 'all' || 
    selectedLength !== 'all' || 
    selectedColor !== 'all' || 
    selectedTexture !== 'all' || 
    selectedHairType !== 'all';

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'wigs', label: 'Wigs' },
    { value: 'bundles', label: 'Hair Bundles' },
    { value: 'closures', label: 'Closures' },
    { value: 'frontals', label: 'Frontals' },
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-500', label: '$200 - $500' },
    { value: '500', label: 'Over $500' },
  ];

  const lengths = [
    { value: 'all', label: 'All Lengths' },
    { value: '8"', label: '8 inches' },
    { value: '10"', label: '10 inches' },
    { value: '12"', label: '12 inches' },
    { value: '14"', label: '14 inches' },
    { value: '16"', label: '16 inches' },
    { value: '18"', label: '18 inches' },
    { value: '20"', label: '20 inches' },
    { value: '22"', label: '22 inches' },
    { value: '24"', label: '24 inches' },
    { value: '26"', label: '26 inches' },
    { value: '28"', label: '28 inches' },
    { value: '30"', label: '30 inches' },
  ];

  const colors = [
    { value: 'all', label: 'All Colors' },
    { value: 'Natural Black', label: 'Natural Black' },
    { value: 'Brown', label: 'Brown' },
    { value: 'Blonde', label: 'Blonde' },
    { value: 'Auburn', label: 'Auburn' },
    { value: 'Burgundy', label: 'Burgundy' },
    { value: 'Ombre', label: 'Ombre' },
    { value: 'Highlights', label: 'Highlights' },
  ];

  const textures = [
    { value: 'all', label: 'All Textures' },
    { value: 'Straight', label: 'Straight' },
    { value: 'Body Wave', label: 'Body Wave' },
    { value: 'Deep Wave', label: 'Deep Wave' },
    { value: 'Curly', label: 'Curly' },
    { value: 'Kinky Straight', label: 'Kinky Straight' },
    { value: 'Kinky Curly', label: 'Kinky Curly' },
  ];

  const hairTypes = [
    { value: 'all', label: 'All Hair Types' },
    { value: 'Brazilian', label: 'Brazilian' },
    { value: 'Peruvian', label: 'Peruvian' },
    { value: 'Malaysian', label: 'Malaysian' },
    { value: 'Indian', label: 'Indian' },
    { value: 'Cambodian', label: 'Cambodian' },
    { value: 'Virgin', label: 'Virgin' },
    { value: 'Remy', label: 'Remy' },
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <Card className="bg-white border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            Filters
          </h3>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Sort By */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Category
            </Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={selectedCategory === category.value}
                    onCheckedChange={() => setSelectedCategory(category.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`category-${category.value}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {category.label}
                  </Label>
                  {selectedCategory === category.value && category.value !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Price Range
            </Label>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${range.value}`}
                    checked={selectedPriceRange === range.value}
                    onCheckedChange={() => setSelectedPriceRange(range.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`price-${range.value}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {range.label}
                  </Label>
                  {selectedPriceRange === range.value && range.value !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Length Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Length
            </Label>
            <div className="space-y-2">
              {lengths.map((length) => (
                <div key={length.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`length-${length.value}`}
                    checked={selectedLength === length.value}
                    onCheckedChange={() => setSelectedLength(length.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`length-${length.value}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {length.label}
                  </Label>
                  {selectedLength === length.value && length.value !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Color
            </Label>
            <div className="space-y-2">
              {colors.map((color) => (
                <div key={color.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color.value}`}
                    checked={selectedColor === color.value}
                    onCheckedChange={() => setSelectedColor(color.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`color-${color.value}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {color.label}
                  </Label>
                  {selectedColor === color.value && color.value !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Texture Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Texture
            </Label>
            <div className="space-y-2">
              {textures.map((texture) => (
                <div key={texture.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`texture-${texture.value}`}
                    checked={selectedTexture === texture.value}
                    onCheckedChange={() => setSelectedTexture(texture.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`texture-${texture.value}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {texture.label}
                  </Label>
                  {selectedTexture === texture.value && texture.value !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hair Type Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Hair Type
            </Label>
            <div className="space-y-2">
              {hairTypes.map((hairType) => (
                <div key={hairType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`hairType-${hairType.value}`}
                    checked={selectedHairType === hairType.value}
                    onCheckedChange={() => setSelectedHairType(hairType.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`hairType-${hairType.value}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {hairType.label}
                  </Label>
                  {selectedHairType === hairType.value && hairType.value !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilter;
