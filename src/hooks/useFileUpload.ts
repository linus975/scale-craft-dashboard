
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, folderPath: string = ''): Promise<string> => {
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create unique filename to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const fullPath = folderPath ? `${user.id}/${folderPath}/${fileName}` : `${user.id}/${fileName}`;
      
      console.log('📤 [useFileUpload] Uploading file:');
      console.log('  - Original name:', file.name);
      console.log('  - Generated name:', fileName);
      console.log('  - Full path:', fullPath);
      console.log('  - File size:', file.size, 'bytes');

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [useFileUpload] Upload error:', error);
        throw error;
      }

      console.log('✅ [useFileUpload] Upload successful:', data.path);
      return data.path;

    } catch (error: any) {
      console.error('❌ [useFileUpload] Upload failed:', error);
      
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Upload",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage
      .from('design-files')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const deleteFile = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('design-files')
        .remove([path]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: "Fehler beim Löschen der Datei",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    uploadFile,
    getFileUrl,
    deleteFile,
    uploading
  };
};
