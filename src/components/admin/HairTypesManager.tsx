
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HairType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const HairTypesManager = () => {
  const [hairTypes, setHairTypes] = useState<HairType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHairType, setEditingHairType] = useState<HairType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchHairTypes();
  }, []);

  const fetchHairTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hair_types')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setHairTypes(data || []);
    } catch (error) {
      console.error('Error fetching hair types:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hair types',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (editingHairType) {
        const { error } = await supabase
          .from('hair_types')
          .update({
            name: formData.name,
            slug,
            description: formData.description,
            is_active: formData.is_active,
            sort_order: formData.sort_order
          })
          .eq('id', editingHairType.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Hair type updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('hair_types')
          .insert({
            name: formData.name,
            slug,
            description: formData.description,
            is_active: formData.is_active,
            sort_order: formData.sort_order
          });

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Hair type created successfully',
        });
      }

      fetchHairTypes();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving hair type:', error);
      toast({
        title: 'Error',
        description: 'Failed to save hair type',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hair_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHairTypes(hairTypes.filter(h => h.id !== id));
      toast({
        title: 'Success',
        description: 'Hair type deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting hair type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hair type',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      sort_order: 0
    });
    setEditingHairType(null);
  };

  const openEditDialog = (hairType: HairType) => {
    setEditingHairType(hairType);
    setFormData({
      name: hairType.name,
      description: hairType.description || '',
      is_active: hairType.is_active,
      sort_order: hairType.sort_order
    });
    setIsDialogOpen(true);
  };

  const filteredHairTypes = hairTypes.filter(hairType =>
    hairType.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h3 className="text-xl font-semibold text-gray-900">Hair Types</h3>
          <p className="text-gray-600">Manage hair type options</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-rosegold-500 hover:bg-rosegold-600 text-white"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Hair Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingHairType ? 'Edit Hair Type' : 'Add New Hair Type'}
              </DialogTitle>
              <DialogDescription>
                {editingHairType 
                  ? 'Update the hair type information below' 
                  : 'Fill in the hair type details'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter hair type name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter hair type description"
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-rosegold-500 hover:bg-rosegold-600">
                  {editingHairType ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Hair Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search hair types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hair Types ({filteredHairTypes.length})</CardTitle>
          <CardDescription>
            Manage available hair type options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHairTypes.map((hairType) => (
                <TableRow key={hairType.id}>
                  <TableCell className="font-medium">{hairType.name}</TableCell>
                  <TableCell>{hairType.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={hairType.is_active ? "default" : "secondary"}>
                      {hairType.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{hairType.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(hairType)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(hairType.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HairTypesManager;
