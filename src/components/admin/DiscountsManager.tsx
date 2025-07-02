import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Percent, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Discount {
  id: string;
  name: string;
  code?: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  created_at: string;
}

const DiscountsManager = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: '',
    minimum_order_amount: '',
    maximum_discount_amount: '',
    usage_limit: '',
    is_active: true,
    starts_at: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts((data || []) as Discount[]);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch discounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        name: formData.name,
        code: formData.code || null,
        description: formData.description || null,
        type: formData.type,
        value: parseFloat(formData.value),
        minimum_order_amount: parseFloat(formData.minimum_order_amount) || 0,
        maximum_discount_amount: formData.maximum_discount_amount ? parseFloat(formData.maximum_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        is_active: formData.is_active,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingDiscount) {
        const result = await supabase
          .from('discounts')
          .update(dataToSave)
          .eq('id', editingDiscount.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('discounts')
          .insert([{ ...dataToSave, usage_count: 0 }]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Discount ${editingDiscount ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchDiscounts();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast({
        title: 'Error',
        description: 'Failed to save discount',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Discount deleted successfully',
      });

      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete discount',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minimum_order_amount: '',
      maximum_discount_amount: '',
      usage_limit: '',
      is_active: true,
      starts_at: '',
      expires_at: ''
    });
    setEditingDiscount(null);
  };

  const editDiscount = (discount: Discount) => {
    setFormData({
      name: discount.name,
      code: discount.code || '',
      description: discount.description || '',
      type: discount.type,
      value: discount.value.toString(),
      minimum_order_amount: discount.minimum_order_amount.toString(),
      maximum_discount_amount: discount.maximum_discount_amount?.toString() || '',
      usage_limit: discount.usage_limit?.toString() || '',
      is_active: discount.is_active,
      starts_at: discount.starts_at ? new Date(discount.starts_at).toISOString().slice(0, 16) : '',
      expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().slice(0, 16) : ''
    });
    setEditingDiscount(discount);
    setIsDialogOpen(true);
  };

  const filteredDiscounts = discounts.filter(discount =>
    discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (discount.code && discount.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isDiscountActive = (discount: Discount) => {
    if (!discount.is_active) return false;
    const now = new Date();
    if (discount.starts_at && new Date(discount.starts_at) > now) return false;
    if (discount.expires_at && new Date(discount.expires_at) < now) return false;
    return true;
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Discounts</h2>
          <p className="text-gray-600">Manage discount codes and promotional offers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-rosegold-500 hover:bg-rosegold-600 text-white"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Add New Discount'}</DialogTitle>
              <DialogDescription>
                {editingDiscount ? 'Update the discount information' : 'Create a new discount code or promotion'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Discount Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Summer Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., SUMMER20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this discount"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed_amount' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rosegold-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Discount Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {formData.type === 'percentage' ? (
                        <Percent className="h-4 w-4 text-gray-400" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.type === 'percentage' ? "100" : undefined}
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimum_order_amount">Minimum Order Amount ($)</Label>
                  <Input
                    id="minimum_order_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_order_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximum_discount_amount">Maximum Discount Amount ($)</Label>
                  <Input
                    id="maximum_discount_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maximum_discount_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maximum_discount_amount: e.target.value }))}
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Start Date & Time</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiry Date & Time</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-rosegold-500 hover:bg-rosegold-600">
                  {editingDiscount ? 'Update Discount' : 'Create Discount'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search discounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discounts ({filteredDiscounts.length})</CardTitle>
          <CardDescription>
            Manage promotional codes and discount offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{discount.name}</div>
                      {discount.description && (
                        <div className="text-sm text-gray-500">{discount.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {discount.code ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {discount.code}
                      </code>
                    ) : (
                      <span className="text-gray-400">No code</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                    </div>
                    {discount.minimum_order_amount > 0 && (
                      <div className="text-xs text-gray-500">
                        Min. order: ${discount.minimum_order_amount}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {discount.usage_count}
                      {discount.usage_limit && ` / ${discount.usage_limit}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isDiscountActive(discount) ? "default" : "secondary"}>
                      {isDiscountActive(discount) ? 'Active' : 'Inactive'}
                    </Badge>
                    {discount.expires_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(discount.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => editDiscount(discount)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(discount.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDiscounts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No discounts found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountsManager;