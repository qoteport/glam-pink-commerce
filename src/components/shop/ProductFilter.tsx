import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface ProductFilterProps {
  categories: FilterOption[];
  textures: FilterOption[];
  lengths: FilterOption[];
  priceRanges: { value: number[]; label: string; }[];
  selectedCategory: string;
  selectedTexture: string;
  selectedLength: string;
  priceRange: number[];
  onCategoryChange: (category: string) => void;
  onTextureChange: (texture: string) => void;
  onLengthChange: (length: string) => void;
  onPriceRangeChange: (range: number[]) => void;
  onClearFilters: () => void;
}

const ProductFilter = ({
  categories,
  textures,
  lengths,
  priceRanges,
  selectedCategory,
  selectedTexture,
  selectedLength,
  priceRange,
  onCategoryChange,
  onTextureChange,
  onLengthChange,
  onPriceRangeChange,
  onClearFilters,
}: ProductFilterProps) => {
  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedTexture !== 'all' || 
    selectedLength !== 'all' || 
    (priceRange[0] !== 0 || priceRange[1] !== 1000);

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
          {/* Category Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Category
            </Label>
            <div className="space-y-2">
              {categories?.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={selectedCategory === category.value}
                    onCheckedChange={() => onCategoryChange(category.value)}
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

          {/* Texture Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Texture
            </Label>
            <div className="space-y-2">
              {textures?.map((texture) => (
                <div key={texture.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`texture-${texture.value}`}
                    checked={selectedTexture === texture.value}
                    onCheckedChange={() => onTextureChange(texture.value)}
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

          {/* Length Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Length
            </Label>
            <div className="space-y-2">
              {lengths?.map((length) => (
                <div key={length.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`length-${length.value}`}
                    checked={selectedLength === length.value}
                    onCheckedChange={() => onLengthChange(length.value)}
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

          {/* Price Range Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Price Range
            </Label>
            <div className="space-y-2">
              {priceRanges?.map((range) => (
                <div key={range.value[0]} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${range.value[0]}`}
                    checked={priceRange[0] === range.value[0] && priceRange[1] === range.value[1]}
                    onCheckedChange={() => onPriceRangeChange(range.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`price-${range.value[0]}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {range.label}
                  </Label>
                  {priceRange[0] === range.value[0] && priceRange[1] === range.value[1] && (
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