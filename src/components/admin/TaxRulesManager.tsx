
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
import { Trash2, Edit } from 'lucide-react';

interface TaxRule {
  id: string;
  name: string;
  description?: string;
  tax_rate: number;
  applies_to: string;
  condition_value?: string;
  is_active: boolean;
}

const TaxRulesManager = () => {
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tax_rate: 0,
    applies_to: 'all',
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
        .from('tax_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching tax rules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tax rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ruleData = {
        ...formData,
        tax_rate: formData.tax_rate / 100 // Convert percentage to decimal
      };

      if (editingRule) {
        const { error } = await supabase
          .from('tax_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Tax rule updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('tax_rules')
          .insert(ruleData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Tax rule created successfully",
        });
      }

      setFormData({
        name: '',
        description: '',
        tax_rate: 0,
        applies_to: 'all',
        condition_value: '',
        is_active: true
      });
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      console.error('Error saving tax rule:', error);
      toast({
        title: "Error",
        description: "Failed to save tax rule",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tax rule deleted successfully",
      });
      fetchRules();
    } catch (error) {
      console.error('Error deleting tax rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete tax rule",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule: TaxRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      tax_rate: rule.tax_rate * 100, // Convert decimal to percentage
      applies_to: rule.applies_to,
      condition_value: rule.condition_value || '',
      is_active: rule.is_active
    });
  };

  const getAppliesToLabel = (appliesTo: string) => {
    switch (appliesTo) {
      case 'all': return 'All Orders';
      case 'category': return 'Product Category';
      case 'location': return 'Customer Location';
      default: return appliesTo;
    }
  };

  if (loading) return <div>Loading tax rules...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingRule ? 'Edit' : 'Create'} Tax Rule</CardTitle>
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
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="applies_to">Applies To</Label>
              <Select
                value={formData.applies_to}
                onValueChange={(value) => setFormData({ ...formData, applies_to: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="category">Product Category</SelectItem>
                  <SelectItem value="location">Customer Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.applies_to !== 'all' && (
              <div>
                <Label htmlFor="condition_value">Condition Value</Label>
                <Input
                  id="condition_value"
                  value={formData.condition_value}
                  onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                  placeholder={
                    formData.applies_to === 'category' ? 'Category name' : 'Location/Country'
                  }
                  required
                />
              </div>
            )}

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
                      tax_rate: 0,
                      applies_to: 'all',
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
          <CardTitle>Tax Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.length === 0 ? (
              <p className="text-gray-500">No tax rules found.</p>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      <p className="text-sm">
                        <span className="font-medium">Tax Rate:</span> {(rule.tax_rate * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Applies To:</span> {getAppliesToLabel(rule.applies_to)}
                      </p>
                      {rule.condition_value && (
                        <p className="text-sm">
                          <span className="font-medium">Condition:</span> {rule.condition_value}
                        </p>
                      )}
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

export default TaxRulesManager;
