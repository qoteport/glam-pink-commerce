import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Search, Clock, Package, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ImageUpload from './ImageUpload';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface OfferProduct {
  id: string;
  product_id: string;
  offer_price: number | null;
  product?: Product;
}

interface Offer {
  id: string;
  name: string;
  description: string | null;
  banner_image: string | null;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  offer_products?: OfferProduct[];
}

const OffersManager = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_image: '',
    discount_percentage: 0,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch offer products for each offer
      const offersWithProducts = await Promise.all(
        (data || []).map(async (offer) => {
          const { data: offerProducts } = await supabase
            .from('offer_products')
            .select('*, product:products(*)')
            .eq('offer_id', offer.id);
          return { ...offer, offer_products: offerProducts || [] };
        })
      );

      setOffers(offersWithProducts);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({ title: 'Error', description: 'Failed to fetch offers', variant: 'destructive' });
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

  const handleOpenDialog = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        name: offer.name,
        description: offer.description || '',
        banner_image: offer.banner_image || '',
        discount_percentage: offer.discount_percentage,
        start_date: offer.start_date.slice(0, 16),
        end_date: offer.end_date.slice(0, 16),
        is_active: offer.is_active,
      });
      const productMap = new Map<string, number>();
      offer.offer_products?.forEach((op) => {
        productMap.set(op.product_id, op.offer_price || 0);
      });
      setSelectedProducts(productMap);
    } else {
      setEditingOffer(null);
      setFormData({
        name: '',
        description: '',
        banner_image: '',
        discount_percentage: 0,
        start_date: '',
        end_date: '',
        is_active: true,
      });
      setSelectedProducts(new Map());
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.start_date || !formData.end_date) {
        toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
        return;
      }

      if (selectedProducts.size === 0) {
        toast({ title: 'Error', description: 'Please select at least one product', variant: 'destructive' });
        return;
      }

      const offerData = {
        name: formData.name,
        description: formData.description || null,
        banner_image: formData.banner_image || null,
        discount_percentage: formData.discount_percentage,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        is_active: formData.is_active,
      };

      let offerId: string;

      if (editingOffer) {
        const { error } = await supabase
          .from('offers')
          .update(offerData)
          .eq('id', editingOffer.id);
        if (error) throw error;
        offerId = editingOffer.id;

        // Delete existing offer products
        await supabase.from('offer_products').delete().eq('offer_id', offerId);
      } else {
        const { data, error } = await supabase
          .from('offers')
          .insert([offerData])
          .select()
          .single();
        if (error) throw error;
        offerId = data.id;
      }

      // Insert offer products
      const offerProducts = Array.from(selectedProducts.entries()).map(([productId, offerPrice]) => ({
        offer_id: offerId,
        product_id: productId,
        offer_price: offerPrice || null,
      }));

      const { error: productsError } = await supabase.from('offer_products').insert(offerProducts);
      if (productsError) throw productsError;

      toast({ title: 'Success', description: `Offer ${editingOffer ? 'updated' : 'created'} successfully` });
      setIsDialogOpen(false);
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({ title: 'Error', description: 'Failed to save offer', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Offer deleted successfully' });
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({ title: 'Error', description: 'Failed to delete offer', variant: 'destructive' });
    }
  };

  const toggleOfferStatus = async (offer: Offer) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: !offer.is_active })
        .eq('id', offer.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Offer ${offer.is_active ? 'stopped' : 'activated'}` });
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer:', error);
      toast({ title: 'Error', description: 'Failed to update offer', variant: 'destructive' });
    }
  };

  const getOfferStatus = (offer: Offer) => {
    const now = new Date();
    const start = new Date(offer.start_date);
    const end = new Date(offer.end_date);

    if (!offer.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    if (now < start) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
    if (now > end) return { label: 'Expired', color: 'bg-red-100 text-red-800' };
    return { label: 'Active', color: 'bg-green-100 text-green-800' };
  };

  const toggleProductSelection = (productId: string, price: number) => {
    const newMap = new Map(selectedProducts);
    if (newMap.has(productId)) {
      newMap.delete(productId);
    } else {
      const discountedPrice = price - (price * formData.discount_percentage) / 100;
      newMap.set(productId, Math.round(discountedPrice * 100) / 100);
    }
    setSelectedProducts(newMap);
  };

  const updateOfferPrice = (productId: string, price: number) => {
    const newMap = new Map(selectedProducts);
    newMap.set(productId, price);
    setSelectedProducts(newMap);
  };

  const filteredOffers = offers.filter((offer) =>
    offer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Offers Management</h2>
          <p className="text-gray-600">Create and manage time-bound offers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-rosegold-500 hover:bg-rosegold-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
              <DialogDescription>
                {editingOffer ? 'Update offer details' : 'Create a time-bound offer with selected products'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Offer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Flash Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Default Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this offer..."
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <ImageUpload
                  onImageUpload={(url) => setFormData({ ...formData, banner_image: url })}
                  currentImage={formData.banner_image}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date & Time *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date & Time *</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              {/* Product Selection */}
              <div className="space-y-4">
                <Label>Select Products for Offer ({selectedProducts.size} selected)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border-b hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id, product.price)}
                        />
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">Original: ₵{product.price.toFixed(2)}</div>
                        </div>
                      </div>
                      {selectedProducts.has(product.id) && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Offer Price:</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={selectedProducts.get(product.id) || ''}
                            onChange={(e) => updateOfferPrice(product.id, parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-rosegold-500 hover:bg-rosegold-600">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Offers ({filteredOffers.length})</CardTitle>
          <CardDescription>Manage your time-bound promotional offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const status = getOfferStatus(offer);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {offer.banner_image && (
                            <img src={offer.banner_image} alt={offer.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium">{offer.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {offer.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Package className="w-3 h-3 mr-1" />
                          {offer.offer_products?.length || 0} products
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(offer.start_date), 'MMM d, yyyy HH:mm')}</div>
                          <div className="text-gray-500">to {format(new Date(offer.end_date), 'MMM d, yyyy HH:mm')}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blush-100 text-blush-800">
                          {offer.discount_percentage}% OFF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleOfferStatus(offer)}>
                            {offer.is_active ? 'Stop' : 'Activate'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenDialog(offer)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(offer.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredOffers.length === 0 && (
              <div className="text-center py-8 text-gray-500">No offers found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OffersManager;
