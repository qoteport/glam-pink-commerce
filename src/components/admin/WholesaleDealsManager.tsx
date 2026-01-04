import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, Save, X, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WholesaleDeal {
  id: string;
  name: string;
  description: string;
  min_quantity: number;
  discount_percentage: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface DealProduct {
  id: string;
  deal_id: string;
  product_id: string;
  wholesale_price: number;
  product: Product;
}

interface SelectedProduct {
  productId: string;
  wholesalePrice: number;
}

const WholesaleDealsManager = () => {
  const [deals, setDeals] = useState<WholesaleDeal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeal, setEditingDeal] = useState<WholesaleDeal | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [savingPrices, setSavingPrices] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_quantity: 1,
    discount_percentage: 0,
    is_active: true
  });

  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedDealId) {
      fetchDealProducts(selectedDealId);
    }
  }, [selectedDealId]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('wholesale_deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wholesale deals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchDealProducts = async (dealId: string) => {
    try {
      const { data, error } = await supabase
        .from('wholesale_deal_products')
        .select(`
          *,
          products!inner (
            id,
            name,
            price,
            image
          )
        `)
        .eq('deal_id', dealId);

      if (error) throw error;

      const transformedData = data?.map(item => ({
        id: item.id,
        deal_id: item.deal_id,
        product_id: item.product_id,
        wholesale_price: item.wholesale_price,
        product: item.products
      })) || [];

      setDealProducts(transformedData);
      
      // Initialize editing prices
      const prices: Record<string, number> = {};
      transformedData.forEach(dp => {
        prices[dp.id] = dp.wholesale_price;
      });
      setEditingPrices(prices);
    } catch (error) {
      console.error('Error fetching deal products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDeal) {
        const { error } = await supabase
          .from('wholesale_deals')
          .update(formData)
          .eq('id', editingDeal.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Deal updated successfully' });
      } else {
        const { error } = await supabase
          .from('wholesale_deals')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Deal created successfully' });
      }

      resetForm();
      fetchDeals();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to save deal',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (deal: WholesaleDeal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      description: deal.description || '',
      min_quantity: deal.min_quantity,
      discount_percentage: deal.discount_percentage,
      is_active: deal.is_active
    });
  };

  const confirmDelete = (id: string) => {
    setDeletingDealId(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingDealId) return;
    
    try {
      // First delete associated products
      await supabase
        .from('wholesale_deal_products')
        .delete()
        .eq('deal_id', deletingDealId);

      // Then delete the deal
      const { error } = await supabase
        .from('wholesale_deals')
        .delete()
        .eq('id', deletingDealId);

      if (error) throw error;
      
      fetchDeals();
      if (selectedDealId === deletingDealId) {
        setSelectedDealId(null);
        setDealProducts([]);
      }
      toast({ title: 'Success', description: 'Deal deleted successfully' });
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete deal',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingDealId(null);
    }
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      const product = products.find(p => p.id === productId);
      const deal = deals.find(d => d.id === selectedDealId);
      const discountedPrice = product && deal 
        ? product.price * (1 - deal.discount_percentage / 100)
        : product?.price || 0;
      
      setSelectedProducts(prev => [...prev, { 
        productId, 
        wholesalePrice: Math.round(discountedPrice * 100) / 100 
      }]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
    }
  };

  const updateSelectedProductPrice = (productId: string, price: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.productId === productId ? { ...p, wholesalePrice: price } : p)
    );
  };

  const addSelectedProductsToDeal = async () => {
    if (!selectedDealId || selectedProducts.length === 0) return;

    try {
      const productsToAdd = selectedProducts.map(sp => ({
        deal_id: selectedDealId,
        product_id: sp.productId,
        wholesale_price: sp.wholesalePrice
      }));

      const { error } = await supabase
        .from('wholesale_deal_products')
        .insert(productsToAdd);

      if (error) throw error;
      
      fetchDealProducts(selectedDealId);
      setSelectedProducts([]);
      toast({ title: 'Success', description: `${productsToAdd.length} product(s) added to deal` });
    } catch (error) {
      console.error('Error adding products to deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add products to deal',
        variant: 'destructive',
      });
    }
  };

  const removeProductFromDeal = async (dealProductId: string) => {
    try {
      const { error } = await supabase
        .from('wholesale_deal_products')
        .delete()
        .eq('id', dealProductId);

      if (error) throw error;
      
      if (selectedDealId) {
        fetchDealProducts(selectedDealId);
      }
      toast({ title: 'Success', description: 'Product removed from deal' });
    } catch (error) {
      console.error('Error removing product from deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove product from deal',
        variant: 'destructive',
      });
    }
  };

  const updateDealProductPrice = async (dealProductId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('wholesale_deal_products')
        .update({ wholesale_price: newPrice })
        .eq('id', dealProductId);

      if (error) throw error;
      
      if (selectedDealId) {
        fetchDealProducts(selectedDealId);
      }
      toast({ title: 'Success', description: 'Price updated' });
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: 'Error',
        description: 'Failed to update price',
        variant: 'destructive',
      });
    }
  };

  const saveAllPrices = async () => {
    setSavingPrices(true);
    try {
      const updates = Object.entries(editingPrices).map(([id, price]) => 
        supabase
          .from('wholesale_deal_products')
          .update({ wholesale_price: price })
          .eq('id', id)
      );

      await Promise.all(updates);
      
      if (selectedDealId) {
        fetchDealProducts(selectedDealId);
      }
      toast({ title: 'Success', description: 'All prices saved' });
    } catch (error) {
      console.error('Error saving prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prices',
        variant: 'destructive',
      });
    } finally {
      setSavingPrices(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      min_quantity: 1,
      discount_percentage: 0,
      is_active: true
    });
    setEditingDeal(null);
  };

  const availableProducts = products.filter(p => 
    !dealProducts.some(dp => dp.product_id === p.id) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDeal = deals.find(d => d.id === selectedDealId);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Wholesale Deals Management</h3>
      </div>

      <Tabs defaultValue="deals" className="w-full">
        <TabsList>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="products">Deal Products</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-6">
          {/* Create/Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingDeal ? <Edit size={20} /> : <Plus size={20} />}
                {editingDeal ? 'Edit Deal' : 'Create New Deal'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Deal Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Bulk Hair Bundle Deal"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount Percentage (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this wholesale deal..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_quantity">Minimum Quantity</Label>
                    <Input
                      id="min_quantity"
                      type="number"
                      min="1"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_quantity: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Active Deal</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Save size={16} className="mr-2" />
                    {editingDeal ? 'Update Deal' : 'Create Deal'}
                  </Button>
                  {editingDeal && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Deals List */}
          <div className="grid gap-4">
            {deals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No wholesale deals yet. Create your first deal above!</p>
                </CardContent>
              </Card>
            ) : (
              deals.map((deal) => (
                <Card key={deal.id} className={editingDeal?.id === deal.id ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-lg">{deal.name}</h4>
                          <Badge variant={deal.is_active ? "default" : "secondary"}>
                            {deal.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {deal.discount_percentage}% OFF
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{deal.description || 'No description'}</p>
                        <p className="text-sm">
                          <span className="font-medium">Min. quantity:</span> {deal.min_quantity} units
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(deal)}>
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => confirmDelete(deal.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Deal Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Manage Deal Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Select Deal</Label>
                  <Select value={selectedDealId || ''} onValueChange={setSelectedDealId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deal to manage products" />
                    </SelectTrigger>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.name} ({deal.discount_percentage}% off)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDealId && selectedDeal && (
                  <div className="space-y-6">
                    {/* Current Products */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Products in "{selectedDeal.name}"</h4>
                        {dealProducts.length > 0 && (
                          <Button 
                            size="sm" 
                            onClick={saveAllPrices}
                            disabled={savingPrices}
                          >
                            <Save size={16} className="mr-2" />
                            {savingPrices ? 'Saving...' : 'Save All Prices'}
                          </Button>
                        )}
                      </div>
                      
                      {dealProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg">
                          No products added to this deal yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dealProducts.map((dealProduct) => (
                            <div key={dealProduct.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                              <div className="flex items-center space-x-4">
                                <img
                                  src={dealProduct.product.image}
                                  alt={dealProduct.product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                  <h5 className="font-medium">{dealProduct.product.name}</h5>
                                  <p className="text-sm text-muted-foreground">
                                    Regular: ₵{dealProduct.product.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm whitespace-nowrap">Wholesale:</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="w-24"
                                    value={editingPrices[dealProduct.id] || ''}
                                    onChange={(e) => setEditingPrices(prev => ({
                                      ...prev,
                                      [dealProduct.id]: Number(e.target.value)
                                    }))}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProductFromDeal(dealProduct.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Products Section */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Add Products to Deal</h4>
                      
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {selectedProducts.length > 0 && (
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">
                              {selectedProducts.length} product(s) selected
                            </span>
                            <Button onClick={addSelectedProductsToDeal}>
                              <Plus size={16} className="mr-2" />
                              Add Selected Products
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {selectedProducts.map(sp => {
                              const product = products.find(p => p.id === sp.productId);
                              return (
                                <div key={sp.productId} className="flex items-center justify-between bg-background p-2 rounded">
                                  <span className="text-sm">{product?.name}</span>
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">₵</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-24 h-8"
                                      value={sp.wholesalePrice}
                                      onChange={(e) => updateSelectedProductPrice(sp.productId, Number(e.target.value))}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleProductSelect(sp.productId, false)}
                                    >
                                      <X size={14} />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {availableProducts.map((product) => {
                          const isSelected = selectedProducts.some(sp => sp.productId === product.id);
                          const suggestedPrice = product.price * (1 - selectedDeal.discount_percentage / 100);
                          
                          return (
                            <div
                              key={product.id}
                              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                              }`}
                              onClick={() => handleProductSelect(product.id, !isSelected)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleProductSelect(product.id, checked as boolean)}
                              />
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ₵{product.price.toFixed(2)} → ₵{suggestedPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {availableProducts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchTerm ? 'No products match your search' : 'All products have been added to this deal'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wholesale Deal</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this deal? This will also remove all associated products from the deal. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WholesaleDealsManager;
