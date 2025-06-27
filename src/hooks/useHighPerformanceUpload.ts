
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

  const uploadMultipleFiles = async (
    files: File[], 
    folderPath: string
  ): Promise<Array<{ file: File; path?: string; error?: string }>> => {
    setUploading(true);
    const results: Array<{ file: File; path?: string; error?: string }> = [];
    
    try {
      console.log(`🚀 [HighPerformanceUpload] Starting multiple upload: ${files.length} files`);
      
      // Upload files sequentially to avoid overwhelming the system
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);
        
        try {
          const path = await uploadFile(file, folderPath);
          results.push({ file, path });
          console.log(`✅ [HighPerformanceUpload] File ${i + 1}/${files.length} uploaded: ${file.name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          results.push({ file, error: errorMessage });
          console.error(`❌ [HighPerformanceUpload] File ${i + 1}/${files.length} failed: ${file.name}`, error);
        }
      }
      
      const successful = results.filter(r => r.path).length;
      const failed = results.filter(r => r.error).length;
      
      console.log(`📊 [HighPerformanceUpload] Upload complete: ${successful} successful, ${failed} failed`);
      
      if (successful > 0) {
        toast({
          title: "Upload erfolgreich",
          description: `${successful} Datei(en) erfolgreich hochgeladen${failed > 0 ? `, ${failed} fehlgeschlagen` : ''}.`,
        });
      }
      
      return results;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    uploadProgress
  };
};
