
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getFileCategory } from '@/utils/fileCategories';
import { UploadedFile } from '@/types/fileUpload';

export const useDirectFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFiles = async (files: File[], partId: string = 'main'): Promise<UploadedFile[]> => {
    setUploading(true);
    
    try {
      console.log('🚀 [DirectFileUpload] Starting direct upload for part:', partId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const uploadedFiles: UploadedFile[] = [];
      
      for (const file of files) {
        const fileCategory = getFileCategory(file.name);
        const fileName = `${Date.now()}-${file.name}`;
        const finalPath = `${user.id}/final-parts/${partId}/${fileCategory}/${fileName}`;
        
        console.log('📤 [DirectFileUpload] Uploading:', file.name, 'to', finalPath);

        const { data, error } = await supabase.storage
          .from('design-files')
          .upload(finalPath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('❌ [DirectFileUpload] Upload error:', error);
          throw new Error(`Upload-Fehler für ${file.name}: ${error.message}`);
        }

        const uploadedFile: UploadedFile = {
          id: `${partId}-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: data.path,
          originalName: file.name,
          fileCategory: fileCategory,
          partId: partId
        };

        uploadedFiles.push(uploadedFile);
        console.log('✅ [DirectFileUpload] File uploaded:', uploadedFile.name);
      }

      toast({
        title: "Dateien hochgeladen",
        description: `${uploadedFiles.length} Datei(en) erfolgreich hochgeladen.`,
      });

      return uploadedFiles;

    } catch (error: any) {
      console.error('❌ [DirectFileUpload] Error:', error);
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
    uploadFiles
  };
};
