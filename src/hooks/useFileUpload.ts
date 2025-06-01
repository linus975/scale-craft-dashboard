
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, folder: string = '') => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      // Use the original filename but check if it already exists
      let fileName = file.name;
      const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

      // Check if file already exists
      const { data: existingFile } = await supabase.storage
        .from('design-files')
        .list(folder ? `${user.id}/${folder}` : user.id, {
          search: fileName
        });

      // If file exists, add timestamp to make it unique
      if (existingFile && existingFile.length > 0) {
        const fileExt = file.name.split('.').pop();
        const fileNameWithoutExt = file.name.replace(`.${fileExt}`, '');
        const timestamp = Date.now();
        fileName = `${fileNameWithoutExt}_${timestamp}.${fileExt}`;
      }

      const finalFilePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(finalFilePath, file);

      if (error) throw error;

      toast({
        title: "Datei hochgeladen",
        description: `Die Datei "${fileName}" wurde erfolgreich hochgeladen.`,
      });

      return data.path;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: error.message,
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
