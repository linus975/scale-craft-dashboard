
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const fileCategory = getFileCategory(file.name);
      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = `${user.id}/temp/${fileCategory}/${fileName}`;
      
      console.log('📤 [SimpleUpload] Uploading file:');
      console.log('  - Original name:', file.name);
      console.log('  - Category:', fileCategory);
      console.log('  - Full path:', fullPath);

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
      
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "Datei entfernt",
      description: "Die Datei wurde aus der Liste entfernt.",
    });
  };

  const clearAllFiles = () => {
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
