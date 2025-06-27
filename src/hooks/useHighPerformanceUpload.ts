
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHighPerformanceUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, folderPath: string = 'temp'): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = `${user.id}/${folderPath}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      setUploadProgress(100);
      return data.path;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler beim Upload",
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
