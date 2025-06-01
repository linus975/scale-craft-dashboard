import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
}

export const useDesignFiles = (design: any, isOpen: boolean) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const { uploadFile, getFileUrl, deleteFile, uploading } = useFileUpload();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && design?.id) {
      loadDesignFiles();
    }
  }, [isOpen, design?.id]);

  const extractOriginalFileName = (path: string, fallbackType: string): string => {
    if (!path) return fallbackType;
    
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    if (fileName.includes('.')) {
      const extension = fileName.split('.').pop();
      
      if (['f3d', 'step', 'stp', 'iges', 'igs', 'dwg', 'dxf'].includes(extension?.toLowerCase() || '')) {
        return `${design.name || 'design'}.${extension}`;
      }
      
      if (extension?.toLowerCase() === 'gcode') {
        return `${design.name || 'design'}.gcode`;
      }
      
      if (extension?.toLowerCase() === 'ini') {
        return `${design.name || 'settings'}.ini`;
      }
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension?.toLowerCase() || '')) {
        return `${design.name || 'preview'}.${extension}`;
      }
      
      return fileName;
    }
    
    return fileName || fallbackType;
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
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'Image File';
      case 'gcode':
        return 'G-Code File';
      default:
        return 'Unknown';
    }
  };

  const loadDesignFiles = async () => {
    if (!design?.id) return;
    
    setLoadingFiles(true);
    try {
      const files: UploadedFile[] = [];
      
      // Add G-Code file if exists (for static designs)
      if (design.design_type === 'static' && design.gcode_file_path) {
        const fileName = extractOriginalFileName(design.gcode_file_path, 'G-Code File');
        files.push({
          id: 'gcode_file',
          name: fileName,
          type: 'G-Code File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.gcode_file_path,
          originalName: fileName
        });
      }

      // Add legacy G-Code if exists and no file path
      if (design.design_type === 'static' && design.gcode && !design.gcode_file_path) {
        files.push({
          id: 'legacy_gcode',
          name: `${design.name || 'design'}.gcode`,
          type: 'G-Code (Legacy)',
          size: `${(design.gcode.length / 1024).toFixed(1)} KB`,
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: '',
          originalName: `${design.name || 'design'}.gcode`
        });
      }
      
      // Add CAD file if exists (for personalized designs)
      if (design.design_type === 'personalized' && design.cad_file_path) {
        const fileName = extractOriginalFileName(design.cad_file_path, 'CAD File');
        files.push({
          id: 'cad_file',
          name: fileName,
          type: 'CAD File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.cad_file_path,
          originalName: fileName
        });
      }

      // Add INI file if exists
      if (design.ini_file_path) {
        const fileName = extractOriginalFileName(design.ini_file_path, 'Settings File');
        files.push({
          id: 'ini_file',
          name: fileName,
          type: 'Settings File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.ini_file_path,
          originalName: fileName
        });
      }

      // Add preview image if exists
      if (design.preview_image_path) {
        const fileName = extractOriginalFileName(design.preview_image_path, 'Preview Image');
        files.push({
          id: 'preview_image',
          name: fileName,
          type: 'Image File',
          size: 'Unknown',
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: design.preview_image_path,
          originalName: fileName
        });
      }

      // Load additional files from storage bucket that are specific to this design
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Look for files in a design-specific folder
          const designFolderPath = `${user.id}/designs/${design.id}/`;
          const { data: storageFiles, error } = await supabase.storage
            .from('design-files')
            .list(designFolderPath, {
              limit: 100
            });

          if (storageFiles && !error) {
            for (const file of storageFiles) {
              const fullPath = `${designFolderPath}${file.name}`;
              // Only add if not already in the list
              if (!files.find(f => f.path === fullPath)) {
                files.push({
                  id: file.id || file.name,
                  name: file.name,
                  type: getFileType(file.name),
                  size: file.metadata?.size ? `${(file.metadata.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
                  uploadDate: new Date(file.created_at || design.created_at).toISOString().split('T')[0],
                  path: fullPath,
                  originalName: file.name
                });
              }
            }
          }
        }
      } catch (storageError) {
        console.error('Error loading storage files:', storageError);
      }

      setUploadedFiles(files);
    } catch (error) {
      console.error('Error loading design files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !design?.id) return;

    try {
      for (const file of Array.from(files)) {
        // Upload files to a design-specific folder
        const filePath = await uploadFile(file, `designs/${design.id}`);
        
        const newFile: UploadedFile = {
          id: Date.now() + Math.random() + '',
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: filePath,
          originalName: file.name
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        
        toast({
          title: "Datei hochgeladen",
          description: `${file.name} wurde erfolgreich hochgeladen.`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Die Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    }
    
    event.target.value = '';
  };

  const handleFileRemove = async (file: UploadedFile) => {
    if (file.id === 'legacy_gcode') {
      toast({
        title: "Nicht löschbar",
        description: "Legacy G-Code kann nicht gelöscht werden.",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.path) {
      toast({
        title: "Fehler",
        description: "Datei-Pfad nicht gefunden.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await deleteFile(file.path);
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
      
      toast({
        title: "Datei gelöscht",
        description: `${file.name} wurde erfolgreich gelöscht.`,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Datei konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleFileDownload = (file: UploadedFile) => {
    if (file.id === 'legacy_gcode') {
      const blob = new Blob([design.gcode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const fileUrl = getFileUrl(file.path);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.originalName || file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    uploadedFiles,
    loadingFiles,
    uploading,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload
  };
};
