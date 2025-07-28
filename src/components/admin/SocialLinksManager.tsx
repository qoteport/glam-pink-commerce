
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  display_order: number;
  followers_count: number;
}

const SocialLinksManager = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ 
    platform: '', 
    url: '', 
    display_order: 0, 
    followers_count: 0 
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load social links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('social_links')
        .insert([newLink]);

      if (error) throw error;

      setNewLink({ platform: '', url: '', display_order: 0, followers_count: 0 });
      setShowAddForm(false);
      fetchSocialLinks();
      toast({
        title: 'Success',
        description: 'Social link added successfully',
      });
    } catch (error) {
      console.error('Error adding social link:', error);
      toast({
        title: 'Error',
        description: 'Failed to add social link',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<SocialLink>) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSocialLinks(prev => prev.map(link => 
        link.id === id ? { ...link, ...updates } : link
      ));
      setEditingId(null);
      toast({
        title: 'Success',
        description: 'Social link updated successfully',
      });
    } catch (error) {
      console.error('Error updating social link:', error);
      toast({
        title: 'Error',
        description: 'Failed to update social link',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSocialLinks(prev => prev.filter(link => link.id !== id));
      toast({
        title: 'Success',
        description: 'Social link deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting social link:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete social link',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await handleUpdate(id, { is_active });
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Social Links Management</h3>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Social Link
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Social Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                value={newLink.platform}
                onChange={(e) => setNewLink(prev => ({ ...prev, platform: e.target.value }))}
                placeholder="e.g., Instagram, Facebook, TikTok"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="followers_count">Followers Count</Label>
              <Input
                id="followers_count"
                type="number"
                value={newLink.followers_count}
                onChange={(e) => setNewLink(prev => ({ ...prev, followers_count: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={newLink.display_order}
                onChange={(e) => setNewLink(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>
                <Save size={16} className="mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {socialLinks.map((link) => (
          <Card key={link.id}>
            <CardContent className="p-4">
              {editingId === link.id ? (
                <EditForm
                  link={link}
                  onSave={(updates) => handleUpdate(link.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{link.platform}</h4>
                        <Badge variant={link.is_active ? "default" : "secondary"}>
                          {link.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          Order: {link.display_order}
                        </Badge>
                        {link.followers_count > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users size={12} />
                            {formatFollowerCount(link.followers_count)}
                          </Badge>
                        )}
                      </div>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {link.url}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.is_active}
                      onCheckedChange={(checked) => toggleActive(link.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(link.id)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const EditForm = ({ 
  link, 
  onSave, 
  onCancel 
}: { 
  link: SocialLink; 
  onSave: (updates: Partial<SocialLink>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    platform: link.platform,
    url: link.url,
    display_order: link.display_order,
    followers_count: link.followers_count,
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-platform">Platform</Label>
        <Input
          id="edit-platform"
          value={formData.platform}
          onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-url">URL</Label>
        <Input
          id="edit-url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-followers">Followers Count</Label>
        <Input
          id="edit-followers"
          type="number"
          value={formData.followers_count}
          onChange={(e) => setFormData(prev => ({ ...prev, followers_count: parseInt(e.target.value) || 0 }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-display-order">Display Order</Label>
        <Input
          id="edit-display-order"
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>
          <Save size={16} className="mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X size={16} className="mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SocialLinksManager;
