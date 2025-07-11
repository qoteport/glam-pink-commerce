import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

interface HeroSetting {
  id: string;
  featured_product_id?: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  background_image?: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const HeroManager = () => {
  const [heroSettings, setHeroSettings] = useState<HeroSetting[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHeroSettings();
    fetchProducts();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select(`
          *,
          products!featured_product_id (id, name, price, image)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHeroSettings(data || []);
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hero settings',
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

  const handleUpdate = async (id: string, updates: Partial<HeroSetting>) => {
    try {
      const { error } = await supabase
        .from('hero_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      fetchHeroSettings();
      setEditingId(null);
      toast({
        title: 'Success',
        description: 'Hero settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating hero settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hero settings',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await handleUpdate(id, { is_active });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hero Section Management</h3>
      </div>

      <div className="grid gap-4">
        {heroSettings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hero Configuration</span>
                <div className="flex items-center gap-2">
                  <Badge variant={setting.is_active ? "default" : "secondary"}>
                    {setting.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={setting.is_active}
                    onCheckedChange={(checked) => toggleActive(setting.id, checked)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingId === setting.id ? (
                <EditForm
                  setting={setting}
                  products={products}
                  onSave={(updates) => handleUpdate(setting.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Title</h4>
                    <p className="text-gray-600">{setting.title}</p>
                  </div>
                  {setting.subtitle && (
                    <div>
                      <h4 className="font-medium">Subtitle</h4>
                      <p className="text-gray-600">{setting.subtitle}</p>
                    </div>
                  )}
                  {setting.cta_text && (
                    <div>
                      <h4 className="font-medium">CTA</h4>
                      <p className="text-gray-600">{setting.cta_text} → {setting.cta_url}</p>
                    </div>
                  )}
                  {setting.featured_product_id && (
                    <div>
                      <h4 className="font-medium">Featured Product</h4>
                      <p className="text-gray-600">Product ID: {setting.featured_product_id}</p>
                    </div>
                  )}
                  <Button onClick={() => setEditingId(setting.id)}>
                    Edit Hero Settings
                  </Button>
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
  setting, 
  products, 
  onSave, 
  onCancel 
}: { 
  setting: HeroSetting; 
  products: Product[];
  onSave: (updates: Partial<HeroSetting>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: setting.title,
    subtitle: setting.subtitle || '',
    cta_text: setting.cta_text || '',
    cta_url: setting.cta_url || '',
    featured_product_id: setting.featured_product_id || 'none',
    background_image: setting.background_image || '',
  });

  const handleSave = () => {
    const saveData = { ...formData };
    // Convert 'none' back to null for featured_product_id
    if (saveData.featured_product_id === 'none') {
      saveData.featured_product_id = '';
    }
    onSave(saveData);
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, background_image: imageUrl }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Main hero title"
        />
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Textarea
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
          placeholder="Hero subtitle description"
        />
      </div>
      <div>
        <Label htmlFor="cta_text">CTA Button Text</Label>
        <Input
          id="cta_text"
          value={formData.cta_text}
          onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
          placeholder="Shop Now, Learn More, etc."
        />
      </div>
      <div>
        <Label htmlFor="cta_url">CTA URL</Label>
        <Input
          id="cta_url"
          value={formData.cta_url}
          onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
          placeholder="/shop, /products, etc."
        />
      </div>
      <div>
        <Label htmlFor="featured_product">Featured Product</Label>
        <Select 
          value={formData.featured_product_id} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, featured_product_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a product to feature" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No product</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - ${product.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Background Image</Label>
        <ImageUpload
          onImageUpload={handleImageUpload}
          currentImage={formData.background_image}
          bucketName="product-images"
          folder="hero"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default HeroManager;