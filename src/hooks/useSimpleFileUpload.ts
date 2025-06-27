
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStorageManager } from './useStorageManager';

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

export const useSimpleFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const { toast } = useToast();
  const { ensureUserFolders } = useStorageManager();

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

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
        return 'Fusion 360 File';
      case 'step':
      case 'stp':
        return 'STEP File';
      case 'iges':
      case 'igs':
        return 'IGES File';
      case 'stl':
        return 'STL File';
      case 'ini':
        return 'Settings File';
      case 'gcode':
      case 'g':
        return 'G-Code File';
      default:
        return 'Unknown File';
    }
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    setUploading(true);
    
    try {
      console.log('🚀 [SimpleUpload] Starting upload process for:', file.name);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ [SimpleUpload] Auth error:', authError);
        throw new Error('Authentifizierung fehlgeschlagen');
      }
      if (!user) {
        console.error('❌ [SimpleUpload] User not authenticated');
        throw new Error('Benutzer nicht angemeldet');  
      }

      // Ensure folder structure exists
      await ensureUserFolders();

      const fileCategory = getFileCategory(file.name);
      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = `${user.id}/temp/${fileCategory}/${fileName}`;
      
      console.log('📤 [SimpleUpload] Upload details:');
      console.log('  - Original name:', file.name);
      console.log('  - Category:', fileCategory);
      console.log('  - Full path:', fullPath);
      console.log('  - File size:', file.size, 'bytes');

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [SimpleUpload] Upload error:', error);
        throw error;
      }

      console.log('✅ [SimpleUpload] Upload successful:', data.path);

      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: getFileType(file.name),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        path: data.path,
        originalName: file.name,
        fileCategory: fileCategory
      };

      setUploadedFiles(prev => [...prev, newFile]);

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde erfolgreich im ${fileCategory} Ordner gespeichert.`,
      });

      return newFile;

    } catch (error: any) {
      console.error('❌ [SimpleUpload] Upload failed:', error);
      
      let errorMessage = "Unbekannter Fehler beim Upload";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    console.log('🗑️ [SimpleUpload] Removing file with ID:', fileId);
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "Datei entfernt",
      description: "Die Datei wurde aus der Liste entfernt.",
    });
  };

  const clearAllFiles = () => {
    console.log('🧹 [SimpleUpload] Clearing all files');
    setUploadedFiles([]);
  };

  // Neue Funktion: Dateien in Design speichern
  const saveFilesToDesign = async (designId: string) => {
    try {
      console.log('💾 [SimpleUpload] Saving files to design:', designId);
      
      for (const file of uploadedFiles) {
        // Hier könntest du die Dateipfade in der designs Tabelle speichern
        // Je nach Dateityp in die entsprechende Spalte
        const updateData: any = {};
        
        if (file.fileCategory === 'CAD') {
          updateData.cad_file_path = file.path;
        } else if (file.fileCategory === 'INI') {
          updateData.ini_file_path = file.path;
        } else if (file.fileCategory === 'GCODE') {
          updateData.gcode_file_path = file.path;
        }

        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from('designs')
            .update(updateData)
            .eq('id', designId);

          if (error) {
            console.error('❌ [SimpleUpload] Error updating design:', error);
          } else {
            console.log('✅ [SimpleUpload] Updated design with file path:', updateData);
          }
        }
      }

      console.log('✅ [SimpleUpload] All files saved to design');
      return true;
    } catch (error) {
      console.error('❌ [SimpleUpload] Error saving files to design:', error);
      return false;
    }
  };

  return {
    uploadedFiles,
    uploading,
    uploadFile,
    removeFile,
    clearAllFiles,
    saveFilesToDesign,
    previewImage
  };
};
