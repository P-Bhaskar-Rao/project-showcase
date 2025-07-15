import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage, deleteImage } from '@/lib/supabase';

// Avatar with fallback component
const AvatarWithFallback = ({ 
  avatar, 
  size = "md", 
  className = "" 
}: { 
  avatar?: string; 
  size?: "sm" | "md" | "lg"; 
  className?: string;
}) => {
  const errorRef = useRef<Set<string>>(new Set());
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-16 h-16 text-sm",
    md: "w-12 h-12 text-sm", 
    lg: "w-20 h-20 text-xl"
  };

  // Check if this specific avatar URL has errored before
  const hasErrored = useMemo(() => {
    return avatar ? errorRef.current.has(avatar) : false;
  }, [avatar]);

  const handleImageError = useCallback(() => {
    if (avatar) {
      errorRef.current.add(avatar);
      setImageError(true);
    }
  }, [avatar]);

  // Reset imageError when avatar changes
  useEffect(() => {
    if (avatar && !hasErrored) {
      setImageError(false);
    }
  }, [avatar, hasErrored]);

  return (
    <>
      {avatar && !imageError && !hasErrored ? (
        <img 
          src={avatar}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
          onError={handleImageError}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
          <User className="h-6 w-6" />
        </div>
      )}
    </>
  );
};

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onError?: (error: string) => void;
  className?: string;
  onImageChange?: (oldUrl: string, newUrl: string) => void;
}

const ImageUpload = ({ value, onChange, onError, className, onImageChange }: ImageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError?.('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Supabase storage
      const imageUrl = await uploadImage(file);
      const oldUrl = value || '';
      onChange(imageUrl);
      onImageChange?.(oldUrl, imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      onError?.('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onChange, onError, value, onImageChange]);

  const handleRemove = async () => {
    if (value) {
      try {
        await deleteImage(value);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          isDragOver 
            ? "border-emerald-500 bg-emerald-50" 
            : "border-gray-300 hover:border-gray-400",
          value && "border-emerald-500 bg-emerald-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value ? (
          // Show uploaded image
          <div className="space-y-2">
            <div className="relative inline-block">
              <AvatarWithFallback 
                avatar={value}
                size="sm"
                className="mx-auto border-2 border-emerald-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 w-5 h-5 p-0 rounded-full"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              Image uploaded
            </p>
          </div>
        ) : (
          // Show upload area
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                {isDragOver 
                  ? "Drop here" 
                  : "Drag & drop or click"
                }
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={isUploading}
              className="flex items-center gap-1 text-xs"
            >
              <Upload className="h-3 w-3" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload profile picture"
      />
    </div>
  );
};

export default ImageUpload; 