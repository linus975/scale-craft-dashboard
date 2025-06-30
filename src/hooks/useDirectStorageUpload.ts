
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DirectUploadedFile {
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

export const useDirectStorageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFileToStorage = async (
    file: File, 
    productName: string, 
    partId: string, 
    partName: string,
    fileCategory: 'CAD' | 'INI' | 'GCODE'
  ): Promise<DirectUploadedFile> => {
    setUploading(true);
    
    try {
      console.log('🚀 [DirectStorageUpload] Starting file upload...');
      console.log('📁 [DirectStorageUpload] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        productName,
        partId,
        partName,
        fileCategory
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      // Strukturierter Pfad: /{user_id}/products/{product_name}/{part_name}/{filename}
      const sanitizedProductName = productName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedPartName = partName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const structuredPath = `${user.id}/products/${sanitizedProductName}/${sanitizedPartName}/${file.name}`;
      
      console.log('📤 [DirectStorageUpload] Upload path:', structuredPath);

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(structuredPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [DirectStorageUpload] Upload error:', error);
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      console.log('✅ [DirectStorageUpload] File uploaded successfully to:', data.path);

      const uploadedFile: DirectUploadedFile = {
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

      console.log('✅ [DirectStorageUpload] Upload completed:', uploadedFile);

      return uploadedFile;

    } catch (error: any) {
      console.error('❌ [DirectStorageUpload] Upload failed:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFileToStorage,
    uploading
  };
};
