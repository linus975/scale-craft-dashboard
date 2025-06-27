
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  partId?: string;
}

export const useUserStorageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const getFileCategory = (fileName: string): 'CAD' | 'INI' | 'GCODE' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
      case 'step':
      case 'stp':
      case 'iges':
      case 'igs':
      case 'dwg':
      case 'dxf':
      case 'stl':
        return 'CAD';
      case 'ini':
        return 'INI';
      case 'gcode':
      case 'g':
        return 'GCODE';
      default:
        return 'CAD';
    }
  };

  const uploadToTemporary = async (file: File, partId: string = 'main'): Promise<UploadedFile> => {
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      const fileCategory = getFileCategory(file.name);
      const fileName = `${Date.now()}-${file.name}`;
      const tempPath = `${user.id}/temp/${partId}/${fileCategory}/${fileName}`;
      
      console.log('📤 Uploading to temporary path:', tempPath);

      const { data, error } = await supabase.storage
        .from('user-storage')
        .upload(tempPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        path: data.path,
        originalName: file.name,
        fileCategory: fileCategory,
        partId: partId
      };

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde in temporären ${fileCategory} Ordner gespeichert.`,
      });

      return uploadedFile;

    } catch (error: any) {
      console.error('Upload error:', error);
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

  const moveToFinalLocation = async (tempFiles: UploadedFile[], designId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      for (const file of tempFiles) {
        const finalPath = `${user.id}/designs/${designId}/parts/${file.partId}/${file.fileCategory}/${file.originalName}`;
        
        // Download from temp location
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('user-storage')
          .download(file.path);

        if (downloadError) throw downloadError;

        // Upload to final location
        const { error: uploadError } = await supabase.storage
          .from('user-storage')
          .upload(finalPath, fileData, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Delete temp file
        const { error: deleteError } = await supabase.storage
          .from('user-storage')
          .remove([file.path]);

        if (deleteError) console.warn('Failed to delete temp file:', deleteError);
      }

      toast({
        title: "Dateien verschoben",
        description: "Alle Dateien wurden erfolgreich in die finalen Ordner verschoben.",
      });

    } catch (error: any) {
      console.error('Move files error:', error);
      toast({
        title: "Fehler beim Verschieben",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    uploading,
    uploadToTemporary,
    moveToFinalLocation
  };
};
