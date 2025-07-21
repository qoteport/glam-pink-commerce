
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

interface Texture {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const TexturesManager = () => {
  const [textures, setTextures] = useState<Texture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTexture, setEditingTexture] = useState<Texture | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTextures();
  }, []);

  const fetchTextures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('textures')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTextures(data || []);
    } catch (error) {
      console.error('Error fetching textures:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch textures',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (editingTexture) {
        const { error } = await supabase
          .from('textures')
          .update({
            name: formData.name,
            slug,
            description: formData.description,
            is_active: formData.is_active,
            sort_order: formData.sort_order
          })
          .eq('id', editingTexture.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Texture updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('textures')
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
          description: 'Texture created successfully',
        });
      }

      fetchTextures();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving texture:', error);
      toast({
        title: 'Error',
        description: 'Failed to save texture',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('textures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTextures(textures.filter(t => t.id !== id));
      toast({
        title: 'Success',
        description: 'Texture deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting texture:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete texture',
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
    setEditingTexture(null);
  };

  const openEditDialog = (texture: Texture) => {
    setEditingTexture(texture);
    setFormData({
      name: texture.name,
      description: texture.description || '',
      is_active: texture.is_active,
      sort_order: texture.sort_order
    });
    setIsDialogOpen(true);
  };

  const filteredTextures = textures.filter(texture =>
    texture.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h3 className="text-xl font-semibold text-gray-900">Textures</h3>
          <p className="text-gray-600">Manage hair textures</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-rosegold-500 hover:bg-rosegold-600 text-white"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Texture
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTexture ? 'Edit Texture' : 'Add New Texture'}
              </DialogTitle>
              <DialogDescription>
                {editingTexture 
                  ? 'Update the texture information below' 
                  : 'Fill in the texture details'
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
                  placeholder="Enter texture name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter texture description"
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
                  {editingTexture ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Textures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search textures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textures ({filteredTextures.length})</CardTitle>
          <CardDescription>
            Manage hair texture options
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
              {filteredTextures.map((texture) => (
                <TableRow key={texture.id}>
                  <TableCell className="font-medium">{texture.name}</TableCell>
                  <TableCell>{texture.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={texture.is_active ? "default" : "secondary"}>
                      {texture.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{texture.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(texture)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(texture.id)}
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

export default TexturesManager;
