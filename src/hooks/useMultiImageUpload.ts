
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export const useMultiImageUpload = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const { toast } = useToast();

  const validateImage = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload only image files.",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const addImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateImage);
    
    if (validFiles.length === 0) return;

    const newImages: ImageFile[] = validFiles.map(file => ({
      id: Date.now() + Math.random() + '',
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    
    toast({
      title: "Images added",
      description: `${validFiles.length} image(s) were successfully added.`,
    });
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addImages(files);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addImages(files);
    }
    // Clear the input
    event.target.value = '';
  };

  const handleImagesChange = (newImages: ImageFile[]) => {
    setImages(newImages);
  };

  // Clean up object URLs when component unmounts or images change
  const cleanupPreviews = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
  };

  return {
    images,
    setImages,
    handleImageDrop,
    handleImageUpload,
    handleImagesChange,
    cleanupPreviews
  };
};
