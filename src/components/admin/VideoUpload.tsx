import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, ExternalLink, Video } from 'lucide-react';

interface VideoUploadProps {
  videoUrl: string;
  onVideoChange: (url: string) => void;
  bucketName?: string;
  folder?: string;
}

const VideoUpload = ({ 
  videoUrl, 
  onVideoChange, 
  bucketName = 'product-images',
  folder = 'videos'
}: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a video file (mp4, webm, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Video file must be less than 50MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = folder ? `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}` : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      onVideoChange(publicUrl);
      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload video',
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
    if (!urlInput.trim()) return;
    onVideoChange(urlInput.trim());
    setUrlInput('');
    toast({
      title: 'Success',
      description: 'Video URL added successfully',
    });
  };

  const removeVideo = () => {
    onVideoChange('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload */}
        <Card>
          <CardContent className="p-4">
            <Label className="block mb-2">Upload Video File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
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
              {uploading ? 'Uploading...' : 'Choose Video File'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Max 50MB • MP4, WebM, etc.</p>
          </CardContent>
        </Card>

        {/* URL Input */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="videoUrl" className="block mb-2">Add Video URL</Label>
            <div className="flex space-x-2">
              <Input
                id="videoUrl"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleUrlAdd}
                disabled={!urlInput.trim()}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">YouTube, Vimeo, or direct video URL</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Video Preview */}
      {videoUrl && (
        <div>
          <Label className="block mb-2">Current Video</Label>
          <div className="relative group max-w-md">
            <div className="bg-muted rounded-lg border overflow-hidden">
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <div className="text-center p-4">
                    <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground break-all">{videoUrl}</p>
                  </div>
                </div>
              ) : (
                <video
                  src={videoUrl}
                  className="w-full aspect-video object-cover"
                  controls
                  muted
                />
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeVideo}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
