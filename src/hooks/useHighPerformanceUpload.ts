
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHighPerformanceUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, folderPath: string): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // FIXED: Create the complete file path including user ID
      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = `${user.id}/${folderPath}/${fileName}`;
      
      console.log('📤 [HighPerformanceUpload] Starting upload:');
      console.log('  - File name:', file.name);
      console.log('  - File size:', file.size);
      console.log('  - Target folder:', folderPath);
      console.log('  - Full path:', fullPath);
      console.log('  - User ID:', user.id);

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [HighPerformanceUpload] Upload error:', error);
        throw error;
      }

      console.log('✅ [HighPerformanceUpload] Upload successful:', data);
      console.log('  - File path:', data.path);
      
      setUploadProgress(100);
      
      toast({
        title: "Upload erfolgreich",
        description: `${file.name} wurde erfolgreich hochgeladen.`,
      });

      return data.path;

    } catch (error: any) {
      console.error('❌ [HighPerformanceUpload] Upload failed:', error);
      
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Upload",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadFile,
    uploading,
    uploadProgress
  };
};
