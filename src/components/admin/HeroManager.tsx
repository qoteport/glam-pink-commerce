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
import { Save, Upload, Eye, X, Plus, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';
import Hero from '../Hero';
import Hero2 from '../Hero2';
import Hero3 from '../Hero3';
import Hero4 from '../Hero4';
import Hero5 from '../Hero5';
import Hero6 from '../Hero6';

interface HeroSetting {
  id: string;
  featured_product_id?: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  background_image?: string;
  hero_design?: string;
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
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setHeroSettings(prev => 
        prev.map(setting => 
          setting.id === id ? { ...setting, ...updates } : setting
        )
      );

      setEditingId(null);
      toast({
        title: 'Success',
        description: 'Hero settings updated successfully',
      });

      // Refresh data to ensure consistency
      fetchHeroSettings();
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

  const renderHeroPreview = (design: string) => {
    switch (design) {
      case 'hero2':
        return <Hero2 />;
      case 'hero3':
        return <Hero3 />;
      case 'hero4':
        return <Hero4 />;
      case 'hero5':
        return <Hero5 />;
      case 'hero6':
        return <Hero6 />;
      default:
        return <Hero />;
    }
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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: setting.title,
    subtitle: setting.subtitle || '',
    cta_text: setting.cta_text || '',
    cta_url: setting.cta_url || '',
    featured_product_id: setting.featured_product_id || 'none',
    background_image: setting.background_image || '',
    hero_design: setting.hero_design || 'hero1',
  });

  // Carousel products state
  const [carouselProducts, setCarouselProducts] = useState<{id: string; product_id: string; display_order: number}[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  useEffect(() => {
    if (formData.hero_design === 'hero6') {
      fetchCarouselProducts();
    }
  }, [formData.hero_design, setting.id]);

  const fetchCarouselProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_carousel_products')
        .select('id, product_id, display_order')
        .eq('hero_setting_id', setting.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCarouselProducts(data || []);
    } catch (error) {
      console.error('Error fetching carousel products:', error);
    }
  };

  const addCarouselProduct = async () => {
    if (!selectedProductId) return;
    
    // Check if product already exists
    if (carouselProducts.some(cp => cp.product_id === selectedProductId)) {
      toast({
        title: 'Already Added',
        description: 'This product is already in the carousel',
        variant: 'destructive',
      });
      return;
    }

    try {
      const maxOrder = carouselProducts.length > 0 
        ? Math.max(...carouselProducts.map(cp => cp.display_order)) + 1 
        : 0;

      const { data, error } = await supabase
        .from('hero_carousel_products')
        .insert({
          hero_setting_id: setting.id,
          product_id: selectedProductId,
          display_order: maxOrder,
        })
        .select()
        .single();

      if (error) throw error;

      setCarouselProducts(prev => [...prev, data]);
      setSelectedProductId('');
      toast({
        title: 'Product Added',
        description: 'Product added to carousel',
      });
    } catch (error) {
      console.error('Error adding carousel product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product to carousel',
        variant: 'destructive',
      });
    }
  };

  const removeCarouselProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hero_carousel_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCarouselProducts(prev => prev.filter(cp => cp.id !== id));
      toast({
        title: 'Product Removed',
        description: 'Product removed from carousel',
      });
    } catch (error) {
      console.error('Error removing carousel product:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove product',
        variant: 'destructive',
      });
    }
  };

  const moveProduct = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= carouselProducts.length) return;

    const newProducts = [...carouselProducts];
    [newProducts[index], newProducts[newIndex]] = [newProducts[newIndex], newProducts[index]];

    // Update display orders
    const updates = newProducts.map((product, idx) => ({
      id: product.id,
      display_order: idx,
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('hero_carousel_products')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      setCarouselProducts(newProducts.map((p, idx) => ({ ...p, display_order: idx })));
    } catch (error) {
      console.error('Error reordering products:', error);
    }
  };

  const handleSave = () => {
    const saveData: any = { ...formData };
    // Convert 'none' back to null for featured_product_id
    if (saveData.featured_product_id === 'none') {
      saveData.featured_product_id = null;
    }
    // Ensure all fields are properly formatted
    onSave(saveData);
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, background_image: imageUrl }));
  };

  const renderHeroPreview = (design: string) => {
    switch (design) {
      case 'hero2':
        return <Hero2 />;
      case 'hero3':
        return <Hero3 />;
      case 'hero4':
        return <Hero4 />;
      case 'hero5':
        return <Hero5 />;
      case 'hero6':
        return <Hero6 />;
      default:
        return <Hero />;
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  return (
    <Tabs defaultValue="edit" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="edit">Edit Settings</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      
      <TabsContent value="edit" className="space-y-4">
        <div>
          <Label htmlFor="hero_design">Hero Design</Label>
          <Select 
            value={formData.hero_design} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, hero_design: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hero design" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero1">Classic Design</SelectItem>
              <SelectItem value="hero2">Modern Dark Design</SelectItem>
              <SelectItem value="hero3">Split Layout Design</SelectItem>
              <SelectItem value="hero4">Image-Only Design</SelectItem>
              <SelectItem value="hero5">Video Background Design</SelectItem>
              <SelectItem value="hero6">Product Carousel Design</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Special note for Hero5 video design */}
        {formData.hero_design === 'hero5' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Video Design:</strong> Upload a video file (.mp4) as the background image, or use a regular image as fallback.
            </p>
          </div>
        )}
        
        {/* Special note for Hero4 image design */}
        {formData.hero_design === 'hero4' && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Image-Only Design:</strong> This design focuses entirely on your background image with minimal text overlay.
            </p>
          </div>
        )}

        {/* Special section for Hero6 - Product Carousel */}
        {formData.hero_design === 'hero6' && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
            <p className="text-sm text-purple-700">
              <strong>Product Carousel Design:</strong> Select products to display in the carousel. Products with videos will show the video instead of image.
            </p>
            
            {/* Add product to carousel */}
            <div className="flex gap-2">
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a product to add" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addCarouselProduct} disabled={!selectedProductId}>
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>

            {/* List of carousel products */}
            <div className="space-y-2">
              <Label>Carousel Products ({carouselProducts.length})</Label>
              {carouselProducts.length === 0 ? (
                <p className="text-sm text-gray-500">No products added yet. Add products above.</p>
              ) : (
                <div className="space-y-2">
                  {carouselProducts.map((cp, index) => (
                    <div 
                      key={cp.id} 
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-400" />
                        <span className="font-medium">{index + 1}.</span>
                        <span>{getProductName(cp.product_id)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => moveProduct(index, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => moveProduct(index, 'down')}
                          disabled={index === carouselProducts.length - 1}
                        >
                          ↓
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCarouselProduct(cp.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
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

        {formData.hero_design !== 'hero6' && (
          <>
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
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save size={16} className="mr-2 text-white" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="preview" className="space-y-4">
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <div className="scale-50 origin-top-left w-[200%] h-[200%] overflow-hidden">
            {renderHeroPreview(formData.hero_design)}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default HeroManager;
