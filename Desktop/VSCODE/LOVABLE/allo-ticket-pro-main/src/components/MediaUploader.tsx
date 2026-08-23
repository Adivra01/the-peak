import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';
import { EventMedia } from '@/types/event';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface MediaUploaderProps {
  onMediaChange: (media: EventMedia[]) => void;
  maxImages?: number;
  maxVideoSize?: number; // in MB
  maxImageSize?: number; // in MB
}

const MediaUploader = ({ 
  onMediaChange, 
  maxImages = 5,
  maxVideoSize = 50,
  maxImageSize = 5
}: MediaUploaderProps) => {
  const [media, setMedia] = useState<EventMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const imageCount = media.filter(m => m.type === 'image').length;
  const hasVideo = media.some(m => m.type === 'video');

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return { valid: false, error: 'Type de fichier non supporté' };
    }

    if (isImage) {
      if (imageCount >= maxImages) {
        return { valid: false, error: `Maximum ${maxImages} images autorisées` };
      }
      if (file.size > maxImageSize * 1024 * 1024) {
        return { valid: false, error: `Image trop volumineuse (max ${maxImageSize}MB)` };
      }
    }

    if (isVideo) {
      if (hasVideo) {
        return { valid: false, error: 'Une seule vidéo autorisée' };
      }
      if (file.size > maxVideoSize * 1024 * 1024) {
        return { valid: false, error: `Vidéo trop volumineuse (max ${maxVideoSize}MB)` };
      }
    }

    return { valid: true };
  }, [imageCount, hasVideo, maxImages, maxImageSize, maxVideoSize]);

  const processFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const newMedia: EventMedia[] = [];

    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Erreur de validation');
        continue;
      }

      const preview = URL.createObjectURL(file);
      newMedia.push({
        id: uuidv4(),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file,
        preview
      });
    }

    if (newMedia.length > 0) {
      const updated = [...media, ...newMedia];
      setMedia(updated);
      onMediaChange(updated);
    }
  }, [media, validateFile, onMediaChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeMedia = useCallback((id: string) => {
    const item = media.find(m => m.id === id);
    if (item) {
      URL.revokeObjectURL(item.preview);
    }
    const updated = media.filter(m => m.id !== id);
    setMedia(updated);
    onMediaChange(updated);
  }, [media, onMediaChange]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }
        `}
      >
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-secondary">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Glissez vos fichiers ici
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ou cliquez pour sélectionner
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              {imageCount}/{maxImages} photos (max {maxImageSize}MB)
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              {hasVideo ? '1/1' : '0/1'} vidéo (max {maxVideoSize}MB)
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {media.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-secondary group"
              >
                {item.type === 'image' ? (
                  <img 
                    src={item.preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    src={item.preview} 
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    item.type === 'video' 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {item.type === 'video' ? 'Vidéo' : 'Photo'}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeMedia(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive rounded-full text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
