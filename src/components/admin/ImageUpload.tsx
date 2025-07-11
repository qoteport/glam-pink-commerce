import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, ExternalLink } from 'lucide-react';

interface ImageUploadProps {
  images?: string[];
  onImagesChange?: (images: string[]) => void;
  maxImages?: number;
  onImageUpload?: (imageUrl: string) => void;
  currentImage?: string;
  bucketName?: string;
  folder?: string;
}

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 10, 
  onImageUpload,
  currentImage,
  bucketName = 'product-images',
  folder = ''
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (images.length >= maxImages) {
      toast({
        title: 'Maximum images reached',
        description: `You can only upload up to ${maxImages} images`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = folder ? `${folder}/${Math.random()}.${fileExt}` : `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (onImageUpload) {
        onImageUpload(publicUrl);
      } else if (onImagesChange) {
        onImagesChange([...images, publicUrl]);
      }
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlAdd = () => {
    if (!imageUrl.trim()) return;
    
    if (images.length >= maxImages) {
      toast({
        title: 'Maximum images reached',
        description: `You can only upload up to ${maxImages} images`,
        variant: 'destructive',
      });
      return;
    }

    if (onImageUpload) {
      onImageUpload(imageUrl.trim());
    } else if (onImagesChange) {
      onImagesChange([...images, imageUrl.trim()]);
    }
    setImageUrl('');
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (onImagesChange) {
      onImagesChange(newImages);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload */}
        <Card>
          <CardContent className="p-4">
            <Label className="block mb-2">Upload Image File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </CardContent>
        </Card>

        {/* URL Input */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="imageUrl" className="block mb-2">Add Image URL</Label>
            <div className="flex space-x-2">
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleUrlAdd}
                disabled={!imageUrl.trim()}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Image */}
      {currentImage && (
        <div>
          <Label className="block mb-2">Current Image</Label>
          <div className="relative group w-32 h-32">
            <img
              src={currentImage}
              alt="Current image"
              className="w-full h-full object-cover rounded-lg border"
            />
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div>
          <Label className="block mb-2">Image Gallery ({images.length}/{maxImages})</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;