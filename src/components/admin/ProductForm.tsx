import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  is_new: boolean;
  is_best_seller: boolean;
  image: string;
  rating: number;
  review_count: number;
  description?: string;
  features?: string[];
  hair_type?: string;
  hair_type_id?: string;
  texture?: string;
  texture_id?: string;
  colors?: string[];
  lengths?: string[];
  size?: string[];
  hair_care_instructions?: string;
  type?: string;
  live_video_url?: string;
  best_seller_threshold?: number;
  image_gallery?: string[];
}

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
}

const ProductForm = ({ product, onSave }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    category: 'wigs',
    category_id: '',
    subcategory: '',
    subcategory_id: '',
    discount_id: '',
    is_new: false,
    is_best_seller: false,
    image: '',
    rating: '0',
    review_count: '0',
    description: '',
    features: '',
    hair_type: '',
    hair_type_id: '',
    texture: '',
    texture_id: '',
    colors: '',
    lengths: '',
    size: '',
    hair_care_instructions: '',
    type: '',
    live_video_url: '',
    best_seller_threshold: '50',
    image_gallery: [] as string[]
  });
  
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [subcategories, setSubcategories] = useState<Array<{id: string, name: string, category_id: string}>>([]);
  const [discounts, setDiscounts] = useState<Array<{id: string, name: string}>>([]);
  const [textures, setTextures] = useState<Array<{id: string, name: string}>>([]);
  const [hairtypes, setHairTypes] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategoriesAndDiscounts();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        category: product.category || 'wigs',
        category_id: (product as any).category_id || '',
        subcategory: product.subcategory || '',
        subcategory_id: (product as any).subcategory_id || '',
        discount_id: (product as any).discount_id || '',
        is_new: product.is_new || false,
        is_best_seller: product.is_best_seller || false,
        image: product.image || '',
        rating: product.rating?.toString() || '0',
        review_count: product.review_count?.toString() || '0',
        description: product.description || '',
        features: product.features?.join(', ') || '',
        hair_type: product.hair_type || '',
        hair_type_id: product.hair_type_id || '',
        texture: product.texture || '',
        texture_id: product.texture_id || '',
        colors: product.colors?.join(', ') || '',
        lengths: product.lengths?.join(', ') || '',
        size: product.size?.join(', ') || '', 
        hair_care_instructions: product.hair_care_instructions || '',
        type: product.type || '',
        live_video_url: product.live_video_url || '',
        best_seller_threshold: product.best_seller_threshold?.toString() || '50',
        image_gallery: product.image_gallery || []
      });
    }
  }, [product]);

  const fetchCategoriesAndDiscounts = async () => {
    try {
      const [categoriesResult, subcategoriesResult, discountsResult, texturesResult, hairTypesResult] = await Promise.all([
        supabase.from('categories').select('id, name').eq('is_active', true).order('sort_order'),
        supabase.from('subcategories').select('id, name, category_id').eq('is_active', true).order('sort_order'),
        supabase.from('discounts').select('id, name').eq('is_active', true),
        supabase.from('textures').select('id, name').eq('is_active', true),
        supabase.from('hair_types').select('id, name').eq('is_active', true),
      ]);
      
      if (categoriesResult.error) throw categoriesResult.error;
      if (subcategoriesResult.error) throw subcategoriesResult.error;
      if (discountsResult.error) throw discountsResult.error;
      if (texturesResult.error) throw texturesResult.error;
      if (hairTypesResult.error) throw hairTypesResult.error;
      
      setCategories(categoriesResult.data || []);
      setSubcategories(subcategoriesResult.data || []);
      setDiscounts(discountsResult.data || []);
      setTextures(texturesResult.data || []);
      setHairTypes(hairTypesResult.data || []);
    } catch (error) {
      console.error('Error fetching categories and discounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        name: formData.name,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        category_id: formData.category_id || null,
        subcategory: formData.subcategory || null,
        subcategory_id: formData.subcategory_id || null,
        discount_id: formData.discount_id || null,
        is_new: formData.is_new,
        is_best_seller: formData.is_best_seller || parseInt(formData.review_count) >= parseInt(formData.best_seller_threshold),
        image: formData.image,
        rating: parseFloat(formData.rating),
        review_count: parseInt(formData.review_count),
        description: formData.description || null,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        hair_type: formData.hair_type || null,
        hair_type_id: formData.hair_type_id || null,
        texture: formData.texture || null,
        texture_id: formData.texture_id || null,
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        lengths: formData.lengths ? formData.lengths.split(',').map(l => l.trim()) : [],
        size: formData.size ? formData.size.split(',').map(s => s.trim()) : [],
        hair_care_instructions: formData.hair_care_instructions || null,
        type: formData.type || null,
        live_video_url: formData.live_video_url || null,
        best_seller_threshold: parseInt(formData.best_seller_threshold),
        image_gallery: formData.image_gallery,
        updated_at: new Date().toISOString()
      };

      console.log(dataToSave);

      let error;

      if (product) {
        const result = await supabase
          .from('products')
          .update(dataToSave)
          .eq('id', product.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('products')
          .insert([dataToSave]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      });

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: `Failed to ${product ? 'update' : 'create'} product`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter product name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            required
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Category *</Label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={(e) => {
              const selectedCategory = categories.find(cat => cat.id === e.target.value);
              setFormData(prev => ({ 
                ...prev, 
                category_id: e.target.value,
                category: selectedCategory?.name.toLowerCase() || '',
                subcategory_id: '',
                subcategory: ''
              }));
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rosegold-500"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

      <div className="space-y-2">
          <Label htmlFor="hair_type_id">Hair Type</Label>
          <select
            id="hair_type_id"
            name="hair_type_id"
            value={formData.hair_type_id}
            onChange={(e) => {
              const selectedHairType = hairtypes.find(hairtype => hairtype.id === e.target.value);
              setFormData(prev => ({ 
                ...prev, 
                hair_type_id: e.target.value,
                hair_type: selectedHairType?.name || '',
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rosegold-500"
          >
            <option value="">Select hair type</option>
            {hairtypes.map(htype => (
              <option key={htype.id} value={htype.id}>{htype.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="best_seller_threshold">Best Seller Threshold</Label>
          <Input
            id="best_seller_threshold"
            name="best_seller_threshold"
            type="number"
            min="1"
            value={formData.best_seller_threshold}
            onChange={handleInputChange}
            placeholder="50"
          />
          <p className="text-sm text-muted-foreground">
            Products with review count above this threshold become best sellers automatically
          </p>
        </div>
      </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hair_care_instructions">Hair Care Instructions</Label>
            <Textarea
              id="hair_care_instructions"
              name="hair_care_instructions"
              value={formData.hair_care_instructions}
              onChange={handleInputChange}
              placeholder="Enter detailed hair care instructions"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live_video_url">Live Video URL</Label>
            <Input
              id="live_video_url"
              name="live_video_url"
              type="url"
              value={formData.live_video_url}
              onChange={handleInputChange}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="colors">Colors (comma separated)</Label>
              <Input
                id="colors"
                name="colors"
                value={formData.colors}
                onChange={handleInputChange}
                placeholder="Black, Brown, Blonde"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lengths">Lengths (comma separated)</Label>
              <Input
                id="lengths"
                name="lengths"
                value={formData.lengths}
                onChange={handleInputChange}
                placeholder="16, 18, 20, 22"
              />
            </div>
               <div className="space-y-2">
              <Label htmlFor="size">Cap sizes (comma separated)</Label>
              <Input
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="Small, Medium, Large"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={formData.image_gallery}
            onImagesChange={(images) => {
              setFormData(prev => ({ 
                ...prev, 
                image_gallery: images,
                image: images[0] || '' // Set first image as main image
              }));
            }}
            maxImages={10}
          />
        </CardContent>
      </Card>

      {/* Product Status */}
      <Card>
        <CardHeader>
          <CardTitle>Product Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_new"
                checked={formData.is_new}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: checked }))}
              />
              <Label htmlFor="is_new">Ready to Ship</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Mark this product as ready to ship for immediate availability
            </p>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_best_seller"
                checked={formData.is_best_seller}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_best_seller: checked }))}
              />
              <Label htmlFor="is_best_seller">Mark as Best Seller (Manual Override)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="discount_id">Apply Discount</Label>
            <select
              id="discount_id"
              name="discount_id"
              value={formData.discount_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No discount</option>
              {discounts.map(discount => (
                <option key={discount.id} value={discount.id}>{discount.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
