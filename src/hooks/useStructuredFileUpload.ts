
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
      console.log('🚀 [StructuredUpload] Starting file upload...');
      console.log('📁 [StructuredUpload] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        productName,
        partId,
        partName
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const fileCategory = getFileCategory(file.name);
      console.log('📂 [StructuredUpload] File category determined:', fileCategory);
      
      // Strukturierter Pfad: /{user_id}/products/{product_name}/{part_name}/{filename}
      // Sanitize names for file system
      const sanitizedProductName = productName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedPartName = partName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const structuredPath = `${user.id}/products/${sanitizedProductName}/${sanitizedPartName}/${file.name}`;
      
      console.log('📤 [StructuredUpload] Upload path:', structuredPath);

      // Check if design-files bucket exists, if not we need to create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const designFilesBucket = buckets?.find(bucket => bucket.name === 'design-files');
      
      if (!designFilesBucket) {
        console.log('🪣 [StructuredUpload] Creating design-files bucket...');
        const { error: bucketError } = await supabase.storage.createBucket('design-files', {
          public: true,
          allowedMimeTypes: ['application/octet-stream', 'text/plain', 'application/json'],
        });
        
        if (bucketError) {
          console.error('❌ [StructuredUpload] Bucket creation failed:', bucketError);
          throw new Error(`Bucket-Erstellung fehlgeschlagen: ${bucketError.message}`);
        }
      }

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

      console.log('✅ [StructuredUpload] File uploaded successfully to:', data.path);

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

      console.log('✅ [StructuredUpload] Upload completed:', uploadedFile);

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde erfolgreich gespeichert.`,
      });

      return uploadedFile;

    } catch (error: any) {
      console.error('❌ [StructuredUpload] Upload failed:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
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
