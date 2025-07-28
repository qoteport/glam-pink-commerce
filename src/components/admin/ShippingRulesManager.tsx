
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus, Edit } from 'lucide-react';

interface ShippingRule {
  id: string;
  name: string;
  description?: string;
  rule_type: string;
  condition_value: string;
  is_active: boolean;
}

const ShippingRulesManager = () => {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<ShippingRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule_type: 'minimum_amount',
    condition_value: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching shipping rules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipping rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('shipping_rules')
          .update(formData)
          .eq('id', editingRule.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Shipping rule updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('shipping_rules')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Shipping rule created successfully",
        });
      }

      setFormData({
        name: '',
        description: '',
        rule_type: 'minimum_amount',
        condition_value: '',
        is_active: true
      });
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      console.error('Error saving shipping rule:', error);
      toast({
        title: "Error",
        description: "Failed to save shipping rule",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shipping_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shipping rule deleted successfully",
      });
      fetchRules();
    } catch (error) {
      console.error('Error deleting shipping rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete shipping rule",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule: ShippingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      rule_type: rule.rule_type,
      condition_value: rule.condition_value,
      is_active: rule.is_active
    });
  };

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case 'minimum_amount': return 'Minimum Amount';
      case 'product_category': return 'Product Category';
      case 'product_specific': return 'Specific Product';
      default: return type;
    }
  };

  if (loading) return <div>Loading shipping rules...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingRule ? 'Edit' : 'Create'} Shipping Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimum_amount">Minimum Amount</SelectItem>
                  <SelectItem value="product_category">Product Category</SelectItem>
                  <SelectItem value="product_specific">Specific Product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition_value">Condition Value</Label>
              <Input
                id="condition_value"
                value={formData.condition_value}
                onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                placeholder={
                  formData.rule_type === 'minimum_amount' ? 'Amount (e.g., 75)' :
                  formData.rule_type === 'product_category' ? 'Category name' :
                  'Product ID'
                }
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit">
                {editingRule ? 'Update' : 'Create'} Rule
              </Button>
              {editingRule && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingRule(null);
                    setFormData({
                      name: '',
                      description: '',
                      rule_type: 'minimum_amount',
                      condition_value: '',
                      is_active: true
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.length === 0 ? (
              <p className="text-gray-500">No shipping rules found.</p>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      <p className="text-sm">
                        <span className="font-medium">Type:</span> {getRuleTypeLabel(rule.rule_type)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Condition:</span> {rule.condition_value}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> {rule.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingRulesManager;
