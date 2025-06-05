
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, ChevronUp, ChevronDown, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface MultiImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  onImageDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  onImageDrop,
  onImageUpload
}) => {
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      onImagesChange(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <Label>Product Images</Label>
      
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={onImageDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('multiImageUpload')?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB each</p>
        <Input
          id="multiImageUpload"
          type="file"
          accept="image/*"
          multiple
          onChange={onImageUpload}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <div className="relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  
                  {/* Controls Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {/* Move Up */}
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => moveImage(index, 'up')}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Move Down */}
                    {index < images.length - 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => moveImage(index, 'down')}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Remove */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="p-1 h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Image Number */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-2 truncate">
                  {image.file.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Image className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
