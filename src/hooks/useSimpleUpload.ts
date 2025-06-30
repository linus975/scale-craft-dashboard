
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFileResult {
  path: string;
  name: string;
  category: 'CAD' | 'INI' | 'GCODE';
}

export const useSimpleUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (
    file: File, 
    productName: string, 
    partName: string,
    fileCategory: 'CAD' | 'INI' | 'GCODE'
  ): Promise<UploadedFileResult> => {
    console.log('🚀 [SimpleUpload] Starting upload:', file.name);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      // Create structured path
      const sanitizedProductName = productName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedPartName = partName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `${user.id}/products/${sanitizedProductName}/${sanitizedPartName}/${file.name}`;
      
      console.log('📤 [SimpleUpload] Upload path:', filePath);

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [SimpleUpload] Upload error:', error);
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      console.log('✅ [SimpleUpload] File uploaded successfully:', data.path);

      return {
        path: data.path,
        name: file.name,
        category: fileCategory
      };

    } catch (error: any) {
      console.error('❌ [SimpleUpload] Upload failed:', error);
      throw error;
    }
  };

  const uploadMultipleFiles = async (
    files: { file: File; partName: string; category: 'CAD' | 'INI' | 'GCODE' }[],
    productName: string
  ): Promise<UploadedFileResult[]> => {
    setUploading(true);
    
    try {
      console.log('🚀 [SimpleUpload] Starting multiple file upload:', files.length, 'files');
      
      const uploadPromises = files.map(({ file, partName, category }) =>
        uploadFile(file, productName, partName, category)
      );

      const results = await Promise.all(uploadPromises);
      console.log('✅ [SimpleUpload] All files uploaded successfully');
      
      return results;
    } catch (error) {
      console.error('❌ [SimpleUpload] Multiple upload failed:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading
  };
};
