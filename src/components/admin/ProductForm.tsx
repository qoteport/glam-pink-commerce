
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  texture?: string;
  colors?: string[];
  lengths?: string[];
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
    subcategory: '',
    is_new: false,
    is_best_seller: false,
    image: '',
    rating: '0',
    review_count: '0',
    description: '',
    features: '',
    hair_type: '',
    texture: '',
    colors: '',
    lengths: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'wigs', label: 'Wigs' },
    { value: 'bundles', label: 'Bundles' },
    { value: 'closures', label: 'Closures' },
    { value: 'frontals', label: 'Frontals' }
  ];

  const textures = [
    'Straight', 'Body Wave', 'Deep Wave', 'Curly', 'Loose Wave', 'Water Wave'
  ];

  const hairTypes = [
    'Virgin Brazilian', 'Virgin Peruvian', 'Virgin Malaysian', 'Virgin Indian'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        category: product.category || 'wigs',
        subcategory: product.subcategory || '',
        is_new: product.is_new || false,
        is_best_seller: product.is_best_seller || false,
        image: product.image || '',
        rating: product.rating?.toString() || '0',
        review_count: product.review_count?.toString() || '0',
        description: product.description || '',
        features: product.features?.join(', ') || '',
        hair_type: product.hair_type || '',
        texture: product.texture || '',
        colors: product.colors?.join(', ') || '',
        lengths: product.lengths?.join(', ') || ''
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        name: formData.name,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        is_new: formData.is_new,
        is_best_seller: formData.is_best_seller,
        image: formData.image,
        rating: parseFloat(formData.rating),
        review_count: parseInt(formData.review_count),
        description: formData.description || null,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        hair_type: formData.hair_type || null,
        texture: formData.texture || null,
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        lengths: formData.lengths ? formData.lengths.split(',').map(l => l.trim()) : [],
        updated_at: new Date().toISOString()
      };

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
          <Label htmlFor="image">Image URL *</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            required
            placeholder="Enter image URL"
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
          <Label htmlFor="original_price">Original Price</Label>
          <Input
            id="original_price"
            name="original_price"
            type="number"
            step="0.01"
            value={formData.original_price}
            onChange={handleInputChange}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rosegold-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Input
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleInputChange}
            placeholder="e.g., Lace Front, HD Lace"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hair_type">Hair Type</Label>
          <select
            id="hair_type"
            name="hair_type"
            value={formData.hair_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rosegold-500"
          >
            <option value="">Select hair type</option>
            {hairTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="texture">Texture</Label>
          <select
            id="texture"
            name="texture"
            value={formData.texture}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rosegold-500"
          >
            <option value="">Select texture</option>
            {textures.map(texture => (
              <option key={texture} value={texture}>{texture}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={handleInputChange}
            placeholder="0.0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review_count">Review Count</Label>
          <Input
            id="review_count"
            name="review_count"
            type="number"
            min="0"
            value={formData.review_count}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>

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
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Features (comma separated)</Label>
        <Textarea
          id="features"
          name="features"
          value={formData.features}
          onChange={handleInputChange}
          placeholder="100% Virgin Hair, Pre-plucked Hairline, Bleached Knots"
          rows={2}
        />
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_new"
            checked={formData.is_new}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: checked }))}
          />
          <Label htmlFor="is_new">Mark as New Product</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_best_seller"
            checked={formData.is_best_seller}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_best_seller: checked }))}
          />
          <Label htmlFor="is_best_seller">Mark as Best Seller</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading} className="bg-rosegold-500 hover:bg-rosegold-600">
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
