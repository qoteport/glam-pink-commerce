import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Trash2, Plus, Crown, Sparkles, Star, Package, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  item_count: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

interface CollectionProduct {
  id: string;
  collection_id: string;
  product_id: string;
  display_order: number;
}

interface Category {
  slug: string;
  name: string;
}

const ProductCollectionsManager = () => {
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<CollectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ProductCollection | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<ProductCollection | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Crown',
    gradient: 'from-blush-400 to-rosegold-400',
    item_count: '',
    category: '',
    is_active: true,
    display_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCollections();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('product_collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch collections',
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
        .select('slug, name')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image, price, category')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCollectionProducts = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('collection_products')
        .select('*')
        .eq('collection_id', collectionId)
        .order('display_order');

      if (error) throw error;
      setCollectionProducts(data || []);
      setSelectedProductIds((data || []).map(cp => cp.product_id));
    } catch (error) {
      console.error('Error fetching collection products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        display_order: Number(formData.display_order)
      };

      let error;
      if (editingCollection) {
        const result = await supabase
          .from('product_collections')
          .update(dataToSave)
          .eq('id', editingCollection.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('product_collections')
          .insert([dataToSave]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Collection ${editingCollection ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingCollection ? 'update' : 'create'} collection`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (collection: ProductCollection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      icon: collection.icon,
      gradient: collection.gradient,
      item_count: collection.item_count || '',
      category: collection.category,
      is_active: collection.is_active,
      display_order: collection.display_order
    });
    setIsDialogOpen(true);
  };

  const handleManageProducts = async (collection: ProductCollection) => {
    setSelectedCollection(collection);
    await fetchCollectionProducts(collection.id);
    setIsProductsDialogOpen(true);
  };

  const handleSaveProducts = async () => {
    if (!selectedCollection) return;

    try {
      // Delete existing collection products
      await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', selectedCollection.id);

      // Insert new collection products
      if (selectedProductIds.length > 0) {
        const insertData = selectedProductIds.map((productId, index) => ({
          collection_id: selectedCollection.id,
          product_id: productId,
          display_order: index
        }));

        const { error } = await supabase
          .from('collection_products')
          .insert(insertData);

        if (error) throw error;
      }

      // Update item count on collection
      await supabase
        .from('product_collections')
        .update({ item_count: `${selectedProductIds.length} items` })
        .eq('id', selectedCollection.id);

      toast({
        title: 'Success',
        description: 'Collection products updated successfully',
      });

      setIsProductsDialogOpen(false);
      setSelectedCollection(null);
      setSelectedProductIds([]);
      fetchCollections();
    } catch (error) {
      console.error('Error saving collection products:', error);
      toast({
        title: 'Error',
        description: 'Failed to save collection products',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const { error } = await supabase
        .from('product_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Collection deleted successfully',
      });

      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'Crown',
      gradient: 'from-blush-400 to-rosegold-400',
      item_count: '',
      category: '',
      is_active: true,
      display_order: 0
    });
    setEditingCollection(null);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return Crown;
      case 'Sparkles':
        return Sparkles;
      case 'Star':
        return Star;
      default:
        return Crown;
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading && collections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Product Collections</h2>
          <p className="text-gray-600">Manage the collections shown on the homepage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
              className="text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? 'Edit Collection' : 'Add New Collection'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Collection Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter collection name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crown">Crown</SelectItem>
                      <SelectItem value="Sparkles">Sparkles</SelectItem>
                      <SelectItem value="Star">Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradient">Gradient</Label>
                  <Input
                    id="gradient"
                    value={formData.gradient}
                    onChange={(e) => setFormData(prev => ({ ...prev, gradient: e.target.value }))}
                    placeholder="e.g., from-blush-400 to-rosegold-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter collection description..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="text-white hover:opacity-90"
                >
                  {loading ? 'Saving...' : (editingCollection ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Manage Products Dialog */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Manage Products - {selectedCollection?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedProductIds.length} products selected
              </span>
              {selectedProductIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProductIds([])}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Products list */}
            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-4 space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProductIds.includes(product.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleProductSelection(product.id)}
                  >
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <span className="font-medium">₵{product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsProductsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProducts}
                className="text-white hover:opacity-90"
              >
                Save Products
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => {
          const IconComponent = getIconComponent(collection.icon);
          return (
            <Card key={collection.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gradient-to-br ${collection.gradient}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{collection.name}</h3>
                      <p className="text-sm text-gray-500">{collection.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManageProducts(collection)}
                      title="Manage Products"
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(collection)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700 text-sm">
                  {collection.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={collection.is_active ? 'default' : 'secondary'}>
                    {collection.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    Order: {collection.display_order}
                  </Badge>
                  {collection.item_count && (
                    <Badge className="bg-blush-100 text-blush-600">
                      {collection.item_count}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No collections found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first collection to get started</p>
        </div>
      )}
    </div>
  );
};

export default ProductCollectionsManager;