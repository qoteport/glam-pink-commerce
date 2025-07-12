import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
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

const WholesaleDealsManager = () => {
  const [deals, setDeals] = useState<WholesaleDeal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeal, setEditingDeal] = useState<WholesaleDeal | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
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
      description: deal.description,
      min_quantity: deal.min_quantity,
      discount_percentage: deal.discount_percentage,
      is_active: deal.is_active
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wholesale_deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchDeals();
      toast({ title: 'Success', description: 'Deal deleted successfully' });
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete deal',
        variant: 'destructive',
      });
    }
  };

  const addProductToDeal = async (dealId: string, productId: string, wholesalePrice: number) => {
    try {
      const { error } = await supabase
        .from('wholesale_deal_products')
        .insert([{
          deal_id: dealId,
          product_id: productId,
          wholesale_price: wholesalePrice
        }]);

      if (error) throw error;
      
      fetchDealProducts(dealId);
      toast({ title: 'Success', description: 'Product added to deal' });
    } catch (error) {
      console.error('Error adding product to deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product to deal',
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
              <CardTitle>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Deal Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount Percentage</Label>
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
                  />
                </div>
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
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingDeal ? 'Update Deal' : 'Create Deal'}
                  </Button>
                  {editingDeal && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Deals List */}
          <div className="grid gap-4">
            {deals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{deal.name}</h4>
                        <Badge variant={deal.is_active ? "default" : "secondary"}>
                          {deal.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{deal.discount_percentage}% OFF</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{deal.description}</p>
                      <p className="text-sm text-gray-500">Min. quantity: {deal.min_quantity}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(deal)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(deal.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Deal Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Deal Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Deal</Label>
                  <Select value={selectedDealId || ''} onValueChange={setSelectedDealId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deal to manage products" />
                    </SelectTrigger>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDealId && (
                  <div className="grid gap-4">
                    <h4 className="font-medium">Current Products in Deal</h4>
                    {dealProducts.map((dealProduct) => (
                      <div key={dealProduct.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={dealProduct.product.image}
                            alt={dealProduct.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h5 className="font-medium">{dealProduct.product.name}</h5>
                            <p className="text-sm text-gray-600">
                              Regular: ${dealProduct.product.price} → Wholesale: ${dealProduct.wholesale_price}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProductFromDeal(dealProduct.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Add Product to Deal</h4>
                      <AddProductForm
                        dealId={selectedDealId}
                        products={products.filter(p => !dealProducts.some(dp => dp.product_id === p.id))}
                        onAdd={addProductToDeal}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AddProductForm = ({ dealId, products, onAdd }: {
  dealId: string;
  products: Product[];
  onAdd: (dealId: string, productId: string, wholesalePrice: number) => void;
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductId && wholesalePrice) {
      onAdd(dealId, selectedProductId, Number(wholesalePrice));
      setSelectedProductId('');
      setWholesalePrice('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Product</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Wholesale Price</Label>
          <Input
            type="number"
            step="0.01"
            placeholder={selectedProduct ? `Regular: $${selectedProduct.price}` : 'Enter wholesale price'}
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={!selectedProductId || !wholesalePrice}>
        <Plus size={16} className="mr-2" />
        Add Product
      </Button>
    </form>
  );
};

export default WholesaleDealsManager;