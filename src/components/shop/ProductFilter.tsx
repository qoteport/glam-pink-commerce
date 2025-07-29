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
  colors: FilterOption[];
  lengths: FilterOption[];
  sizes: FilterOption[];
  hairTypes: FilterOption[];
  priceRanges: { value: number[]; label: string; }[];
  selectedCategory: string;
  selectedColor: string;
  selectedLength: string;
  selectedSize: string;
  selectedHairType: string;
  priceRange: number[];
  onCategoryChange: (category: string) => void;
  onColorChange: (color: string) => void;
  onLengthChange: (length: string) => void;
  onSizeChange: (size: string) => void;
  onHairTypeChange: (hairType: string) => void;
  onPriceRangeChange: (range: number[]) => void;
  onClearFilters: () => void;
}

const ProductFilter = ({
  categories,
  colors,
  lengths,
  sizes,
  hairTypes,
  priceRanges,
  selectedCategory,
  selectedColor,
  selectedLength,
  selectedSize,
  selectedHairType,
  priceRange,
  onCategoryChange,
  onColorChange,
  onLengthChange,
  onSizeChange,
  onHairTypeChange,
  onPriceRangeChange,
  onClearFilters,
}: ProductFilterProps) => {
  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedColor !== 'all' || 
    selectedLength !== 'all' || 
    selectedSize !== 'all' || 
    selectedHairType !== 'all' || 
    (priceRange[0] !== 0 || priceRange[1] !== 1000);

  // Color name to hex mapping for common colors
  const colorMap: { [key: string]: string } = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    brown: '#A52A2A',
    blonde: '#F5E050',
    gray: '#808080',
    purple: '#800080',
    pink: '#FFC1CC',
  };

  // Function to get display color (hex or name)
  const getColorDisplay = (color: string) => {
    if (color.startsWith('#')) {
      return { isHex: true, value: color };
    }
    const lowercaseColor = color.toLowerCase();
    return colorMap[lowercaseColor] 
      ? { isHex: true, value: colorMap[lowercaseColor] }
      : { isHex: false, value: color };
  };

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

        <div className="space-y-6 text-left">
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

          {/* Color Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Color
            </Label>
            <div className="space-y-2">
              {colors?.map((color) => {
                const colorDisplay = getColorDisplay(color.value);
                return (
                  <div key={color.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.value}`}
                      checked={selectedColor === color.value}
                      onCheckedChange={() => onColorChange(color.value)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex items-center gap-2">
                      {colorDisplay.isHex && color.value !== 'all' && (
                        <div 
                          className="w-4 h-4 rounded-full border border-border" 
                          style={{ backgroundColor: colorDisplay.value }}
                        />
                      )}
                      <Label 
                        htmlFor={`color-${color.value}`}
                        className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {color.label}
                      </Label>
                    </div>
                    {selectedColor === color.value && color.value !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                );
              })}
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

          {/* Size Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Cap Size
            </Label>
            <div className="space-y-2">
              {sizes?.map((size) => (
                <div key={size.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.value}`}
                    checked={selectedSize === size.value}
                    onCheckedChange={() => onSizeChange(size.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`size-${size.value}`}
                    className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {size.label}
                  </Label>
                  {selectedSize === size.value && size.value !== 'all' && (
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
              {hairTypes?.map((hairType) => (
                <div key={hairType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`hairType-${hairType.value}`}
                    checked={selectedHairType === hairType.value}
                    onCheckedChange={() => onHairTypeChange(hairType.value)}
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

          {/* Price Range Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Price Range
            </Label>
            <div className="space-y-2">
              {priceRanges?.map((range) => (
                <div key={range?.value[0]} className="flex items-center space-x-2">
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