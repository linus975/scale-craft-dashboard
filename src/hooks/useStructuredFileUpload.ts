
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getFileCategory } from '@/utils/fileCategories';

export interface StructuredUploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  partId: string;
  partName: string;
}

export const useStructuredFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFileToProduct = async (
    file: File, 
    productName: string, 
    partId: string, 
    partName: string
  ): Promise<StructuredUploadedFile> => {
    setUploading(true);
    
    try {
      console.log('🚀 [StructuredUpload] Starting structured upload...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const fileCategory = getFileCategory(file.name);
      
      // Strukturierter Pfad: /{user_id}/products/{product_name}/{part_name}/{filename}
      const structuredPath = `${user.id}/products/${productName}/${partName}/${file.name}`;
      
      console.log('📤 [StructuredUpload] Upload details:');
      console.log('  - File:', file.name);
      console.log('  - Product:', productName);
      console.log('  - Part:', partName);
      console.log('  - Path:', structuredPath);

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(structuredPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [StructuredUpload] Upload error:', error);
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      const uploadedFile: StructuredUploadedFile = {
        id: `${partId}-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        path: data.path,
        originalName: file.name,
        fileCategory: fileCategory,
        partId: partId,
        partName: partName
      };

      console.log('✅ [StructuredUpload] File uploaded successfully:', uploadedFile);

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde für ${partName} gespeichert.`,
      });

      return uploadedFile;

    } catch (error: any) {
      console.error('❌ [StructuredUpload] Error:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadFileToProduct
  };
};
