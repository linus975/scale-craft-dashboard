
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

export const useSimpleFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
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
        return 'CAD'; // Default fallback
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

  const uploadFile = async (file: File): Promise<void> => {
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

      const fileCategory = getFileCategory(file.name);
      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = `${user.id}/temp/${fileCategory}/${fileName}`;
      
      console.log('📤 [SimpleUpload] Upload details:');
      console.log('  - Original name:', file.name);
      console.log('  - Category:', fileCategory);
      console.log('  - Full path:', fullPath);
      console.log('  - File size:', file.size, 'bytes');
      console.log('  - File type:', file.type);

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

  return {
    uploadedFiles,
    uploading,
    uploadFile,
    removeFile,
    clearAllFiles,
    previewImage
  };
};
