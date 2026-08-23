import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadSectionProps {
  imageUrl: string;
  gallery: string[];
  videoUrl: string;
  onImageUrlChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
  onVideoUrlChange: (url: string) => void;
  eventId?: string;
}

const MediaUploadSection = ({
  imageUrl,
  gallery,
  videoUrl,
  onImageUrlChange,
  onGalleryChange,
  onVideoUrlChange,
  eventId
}: MediaUploadSectionProps) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const { toast } = useToast();
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('event-media')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur d\'upload',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Type de fichier invalide',
        description: 'Veuillez sélectionner une image',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'L\'image doit faire moins de 5 Mo',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingImage(true);
    const url = await uploadFile(file, 'images');
    if (url) {
      onImageUrlChange(url);
      toast({
        title: 'Image uploadée',
        description: 'L\'image principale a été ajoutée avec succès',
      });
    }
    setIsUploadingImage(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validImages = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (validImages.length + gallery.length > 5) {
      toast({
        title: 'Limite atteinte',
        description: 'Maximum 5 images dans la galerie',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingGallery(true);
    const uploadedUrls: string[] = [];

    for (const file of validImages) {
      const url = await uploadFile(file, 'gallery');
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length > 0) {
      onGalleryChange([...gallery, ...uploadedUrls]);
      toast({
        title: 'Images uploadées',
        description: `${uploadedUrls.length} image(s) ajoutée(s) à la galerie`,
      });
    }
    setIsUploadingGallery(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Type de fichier invalide',
        description: 'Veuillez sélectionner une vidéo',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La vidéo doit faire moins de 50 Mo',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingVideo(true);
    const url = await uploadFile(file, 'videos');
    if (url) {
      onVideoUrlChange(url);
      toast({
        title: 'Vidéo uploadée',
        description: 'La vidéo a été ajoutée avec succès',
      });
    }
    setIsUploadingVideo(false);
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    onGalleryChange(newGallery);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="space-y-2">
        <Label>Image principale</Label>
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleMainImageUpload}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
        />
        {imageUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden group">
            <img 
              src={imageUrl} 
              alt="Image principale" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Changer'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onImageUrlChange('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
          >
            {isUploadingImage ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <Image className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Cliquez pour uploader l'image principale
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP • Max 5 Mo
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <Label>Galerie ({gallery.length}/5)</Label>
        <input
          type="file"
          ref={galleryInputRef}
          onChange={handleGalleryUpload}
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
        />
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {gallery.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <img 
                src={url} 
                alt={`Galerie ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {gallery.length < 5 && (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploadingGallery}
              className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
            >
              {isUploadingGallery ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ajouter</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Video */}
      <div className="space-y-2">
        <Label>Vidéo (optionnel)</Label>
        <input
          type="file"
          ref={videoInputRef}
          onChange={handleVideoUpload}
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
        />
        {videoUrl ? (
          <div className="relative rounded-lg overflow-hidden group">
            <video 
              src={videoUrl}
              controls
              className="w-full h-40 object-cover"
            />
            <button
              type="button"
              onClick={() => onVideoUrlChange('')}
              className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploadingVideo}
            className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
          >
            {isUploadingVideo ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <>
                <Video className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Uploader une vidéo • MP4, WEBM • Max 50 Mo
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaUploadSection;
