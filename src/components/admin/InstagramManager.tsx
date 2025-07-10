import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X, Instagram } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

interface InstagramSettings {
  id: string;
  instagram_handle?: string;
  hashtag?: string;
  display_feed: boolean;
  feed_title?: string;
  feed_subtitle?: string;
}

interface InstagramPost {
  id: string;
  image_url: string;
  caption?: string;
  likes_count: number;
  post_url?: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
}

const InstagramManager = () => {
  const [settings, setSettings] = useState<InstagramSettings | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPost, setNewPost] = useState({
    image_url: '',
    caption: '',
    likes_count: 0,
    post_url: '',
    display_order: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInstagramData();
  }, []);

  const fetchInstagramData = async () => {
    try {
      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('instagram_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      setSettings(settingsData);

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('display_order');

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Instagram data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<InstagramSettings>) => {
    try {
      if (settings?.id) {
        const { error } = await supabase
          .from('instagram_settings')
          .update(updates)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('instagram_settings')
          .insert([updates]);

        if (error) throw error;
      }

      fetchInstagramData();
      setEditingSettings(false);
      toast({
        title: 'Success',
        description: 'Instagram settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating Instagram settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Instagram settings',
        variant: 'destructive',
      });
    }
  };

  const handleAddPost = async () => {
    try {
      const { error } = await supabase
        .from('instagram_posts')
        .insert([newPost]);

      if (error) throw error;

      setNewPost({ image_url: '', caption: '', likes_count: 0, post_url: '', display_order: 0 });
      setShowAddForm(false);
      fetchInstagramData();
      toast({
        title: 'Success',
        description: 'Instagram post added successfully',
      });
    } catch (error) {
      console.error('Error adding Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to add Instagram post',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePost = async (id: string, updates: Partial<InstagramPost>) => {
    try {
      const { error } = await supabase
        .from('instagram_posts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setPosts(prev => prev.map(post => 
        post.id === id ? { ...post, ...updates } : post
      ));
      setEditingPostId(null);
      toast({
        title: 'Success',
        description: 'Instagram post updated successfully',
      });
    } catch (error) {
      console.error('Error updating Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Instagram post',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('instagram_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: 'Success',
        description: 'Instagram post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete Instagram post',
        variant: 'destructive',
      });
    }
  };

  const togglePostActive = async (id: string, is_active: boolean) => {
    await handleUpdatePost(id, { is_active });
  };

  const togglePostFeatured = async (id: string, is_featured: boolean) => {
    await handleUpdatePost(id, { is_featured });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Instagram Feed Management</h3>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Instagram Settings</span>
            <Button 
              variant="outline" 
              onClick={() => setEditingSettings(!editingSettings)}
            >
              {editingSettings ? 'Cancel' : 'Edit Settings'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingSettings ? (
            <SettingsForm
              settings={settings}
              onSave={handleUpdateSettings}
              onCancel={() => setEditingSettings(false)}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Instagram Handle</h4>
                <p className="text-gray-600">{settings?.instagram_handle || 'Not set'}</p>
              </div>
              <div>
                <h4 className="font-medium">Hashtag</h4>
                <p className="text-gray-600">{settings?.hashtag || 'Not set'}</p>
              </div>
              <div>
                <h4 className="font-medium">Feed Title</h4>
                <p className="text-gray-600">{settings?.feed_title || 'Not set'}</p>
              </div>
              <div>
                <h4 className="font-medium">Feed Subtitle</h4>
                <p className="text-gray-600">{settings?.feed_subtitle || 'Not set'}</p>
              </div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Display Feed</h4>
                <Badge variant={settings?.display_feed ? "default" : "secondary"}>
                  {settings?.display_feed ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Instagram Posts</span>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Add Post
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Add New Instagram Post</CardTitle>
              </CardHeader>
              <CardContent>
                <PostForm
                  post={newPost}
                  onChange={setNewPost}
                  onSave={handleAddPost}
                  onCancel={() => setShowAddForm(false)}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  {editingPostId === post.id ? (
                    <PostEditForm
                      post={post}
                      onSave={(updates) => handleUpdatePost(post.id, updates)}
                      onCancel={() => setEditingPostId(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {post.image_url && (
                          <img 
                            src={post.image_url} 
                            alt="Instagram post" 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={post.is_active ? "default" : "secondary"}>
                              {post.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {post.is_featured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                            <Badge variant="outline">Order: {post.display_order}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
                          <p className="text-xs text-gray-500">❤️ {post.likes_count} likes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={post.is_active}
                          onCheckedChange={(checked) => togglePostActive(post.id, checked)}
                        />
                        <Switch
                          checked={post.is_featured}
                          onCheckedChange={(checked) => togglePostFeatured(post.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPostId(post.id)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

const SettingsForm = ({ 
  settings, 
  onSave, 
  onCancel 
}: { 
  settings: InstagramSettings | null; 
  onSave: (updates: Partial<InstagramSettings>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    instagram_handle: settings?.instagram_handle || '',
    hashtag: settings?.hashtag || '',
    display_feed: settings?.display_feed ?? true,
    feed_title: settings?.feed_title || '',
    feed_subtitle: settings?.feed_subtitle || '',
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="instagram_handle">Instagram Handle</Label>
        <Input
          id="instagram_handle"
          value={formData.instagram_handle}
          onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
          placeholder="@glamcrownbeauty"
        />
      </div>
      <div>
        <Label htmlFor="hashtag">Hashtag</Label>
        <Input
          id="hashtag"
          value={formData.hashtag}
          onChange={(e) => setFormData(prev => ({ ...prev, hashtag: e.target.value }))}
          placeholder="#GlamCrownLooks"
        />
      </div>
      <div>
        <Label htmlFor="feed_title">Feed Title</Label>
        <Input
          id="feed_title"
          value={formData.feed_title}
          onChange={(e) => setFormData(prev => ({ ...prev, feed_title: e.target.value }))}
          placeholder="See Real Results on Instagram"
        />
      </div>
      <div>
        <Label htmlFor="feed_subtitle">Feed Subtitle</Label>
        <Textarea
          id="feed_subtitle"
          value={formData.feed_subtitle}
          onChange={(e) => setFormData(prev => ({ ...prev, feed_subtitle: e.target.value }))}
          placeholder="Tag us and use our hashtag for a chance to be featured!"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="display_feed"
          checked={formData.display_feed}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, display_feed: checked }))}
        />
        <Label htmlFor="display_feed">Display Instagram Feed</Label>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>
          <Save size={16} className="mr-2" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const PostForm = ({ 
  post, 
  onChange, 
  onSave, 
  onCancel 
}: { 
  post: any; 
  onChange: (post: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const handleImageUpload = (imageUrl: string) => {
    onChange({ ...post, image_url: imageUrl });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Image</Label>
        <ImageUpload
          onImageUpload={handleImageUpload}
          currentImage={post.image_url}
          bucketName="product-images"
          folder="instagram"
        />
      </div>
      <div>
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={post.caption}
          onChange={(e) => onChange({ ...post, caption: e.target.value })}
          placeholder="Post caption..."
        />
      </div>
      <div>
        <Label htmlFor="likes_count">Likes Count</Label>
        <Input
          id="likes_count"
          type="number"
          value={post.likes_count}
          onChange={(e) => onChange({ ...post, likes_count: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div>
        <Label htmlFor="post_url">Post URL (optional)</Label>
        <Input
          id="post_url"
          value={post.post_url}
          onChange={(e) => onChange({ ...post, post_url: e.target.value })}
          placeholder="https://instagram.com/p/..."
        />
      </div>
      <div>
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          value={post.display_order}
          onChange={(e) => onChange({ ...post, display_order: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave}>
          <Save size={16} className="mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const PostEditForm = ({ 
  post, 
  onSave, 
  onCancel 
}: { 
  post: InstagramPost; 
  onSave: (updates: Partial<InstagramPost>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    image_url: post.image_url,
    caption: post.caption || '',
    likes_count: post.likes_count,
    post_url: post.post_url || '',
    display_order: post.display_order,
  });

  const handleSave = () => {
    onSave(formData);
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Image</Label>
        <ImageUpload
          onImageUpload={handleImageUpload}
          currentImage={formData.image_url}
          bucketName="product-images"
          folder="instagram"
        />
      </div>
      <div>
        <Label htmlFor="edit-caption">Caption</Label>
        <Textarea
          id="edit-caption"
          value={formData.caption}
          onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-likes">Likes Count</Label>
        <Input
          id="edit-likes"
          type="number"
          value={formData.likes_count}
          onChange={(e) => setFormData(prev => ({ ...prev, likes_count: parseInt(e.target.value) || 0 }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-url">Post URL</Label>
        <Input
          id="edit-url"
          value={formData.post_url}
          onChange={(e) => setFormData(prev => ({ ...prev, post_url: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-order">Display Order</Label>
        <Input
          id="edit-order"
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
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default InstagramManager;