
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { useStorageFolderManager } from '@/hooks/useStorageFolderManager';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string; // This will now store the part NAME
}

export const useDesignFiles = (design: any, isOpen: boolean) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const { uploadFile, getFileUrl, deleteFile, uploading } = useFileUpload();
  const { ensureTempPartsFolder, checkStorageStructure } = useStorageFolderManager();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && design?.id) {
      loadDesignFiles();
      // Check storage structure when dialog opens
      checkStorageStructure();
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
    console.log('🔄 [useDesignFiles] Loading files for design:', design.id);
    
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
          originalName: fileName,
          partId: 'main' // Default part name for legacy files
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
          originalName: `${design.name || 'design'}.gcode`,
          partId: 'main' // Default part name for legacy files
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
          originalName: fileName,
          partId: 'main' // Default part name for legacy files
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
          originalName: fileName,
          partId: 'main' // Default part name for legacy files
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
          originalName: fileName,
          partId: 'main' // Default part name for legacy files
        });
      }

      // Load additional files from storage bucket that are specific to this design
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('👤 [useDesignFiles] Loading files for user:', user.id);
          
          // Look for files in the new temp-parts structure
          const tempPartsPath = `${user.id}/temp-parts/`;
          console.log('📂 [useDesignFiles] Checking temp-parts path:', tempPartsPath);
          
          const { data: storageFiles, error } = await supabase.storage
            .from('design-files')
            .list(tempPartsPath, {
              limit: 100
            });

          if (error) {
            console.error('❌ [useDesignFiles] Error listing temp-parts:', error);
          } else {
            console.log('📁 [useDesignFiles] Found part folders:', storageFiles?.map(f => f.name) || []);
          }

          if (storageFiles && !error) {
            // Process each part folder
            for (const partFolder of storageFiles) {
              if (partFolder.name && partFolder.name !== '.keep') {
                const partPath = `${tempPartsPath}${partFolder.name}/`;
                console.log('🔍 [useDesignFiles] Checking part folder:', partPath);
                
                const { data: partFiles, error: partError } = await supabase.storage
                  .from('design-files')
                  .list(partPath, {
                    limit: 100
                  });

                if (partError) {
                  console.error(`❌ [useDesignFiles] Error listing files in ${partFolder.name}:`, partError);
                } else {
                  console.log(`📄 [useDesignFiles] Files in ${partFolder.name}:`, partFiles?.map(f => f.name) || []);
                }

                if (partFiles && !partError) {
                  for (const file of partFiles) {
                    // Skip .keep files
                    if (file.name === '.keep') continue;
                    
                    const fullPath = `${partPath}${file.name}`;
                    
                    const newFile: UploadedFile = {
                      id: file.id || `${partFolder.name}-${file.name}`,
                      name: file.name,
                      type: getFileType(file.name),
                      size: file.metadata?.size ? `${(file.metadata.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
                      uploadDate: new Date(file.created_at || design.created_at).toISOString().split('T')[0],
                      path: fullPath,
                      originalName: file.name,
                      partId: partFolder.name // FIXED: Use the part folder name as partId
                    };
                    
                    files.push(newFile);
                    console.log(`✅ [useDesignFiles] Added file: ${file.name} to part: ${partFolder.name}`);
                  }
                }
              }
            }
          }
        }
      } catch (storageError) {
        console.error('❌ [useDesignFiles] Error loading storage files:', storageError);
      }

      console.log('📋 [useDesignFiles] Final loaded files:', files.map(f => ({ name: f.name, partId: f.partId })));
      setUploadedFiles(files);
    } catch (error) {
      console.error('❌ [useDesignFiles] Error loading design files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, partName: string = 'main') => {
    const files = event.target.files;
    if (!files || !design?.id) return;

    console.log('🎯 [useDesignFiles] UPLOAD START for part:', partName);
    console.log('  - Files to upload:', files.length);
    console.log('  - Target part name:', partName);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      for (const file of Array.from(files)) {
        console.log(`📤 [useDesignFiles] Uploading file: ${file.name} to part: ${partName}`);
        
        // FIXED: Create the proper folder structure and upload directly
        const fileName = `${Date.now()}-${file.name}`;
        const fullPath = `${user.id}/temp-parts/${partName}/${fileName}`;
        
        console.log('📁 [useDesignFiles] Full upload path:', fullPath);
        
        // Upload the file directly to the correct path
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('design-files')
          .upload(fullPath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ [useDesignFiles] Upload error for ${file.name}:`, uploadError);
          throw uploadError;
        }
        
        console.log(`✅ [useDesignFiles] File uploaded successfully:`, uploadData);
        
        const newFile: UploadedFile = {
          id: `${partName}-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: uploadData.path,
          originalName: file.name,
          partId: partName // FIXED: Store the correct part name
        };
        
        console.log('✅ [useDesignFiles] File uploaded and assigned to part:', { name: file.name, partId: partName });
        
        setUploadedFiles(prev => {
          const updated = [...prev, newFile];
          console.log('📊 [useDesignFiles] Updated file list:', updated.map(f => ({ name: f.name, partId: f.partId })));
          return updated;
        });
        
        toast({
          title: "Datei hochgeladen",
          description: `${file.name} wurde erfolgreich zu "${partName}" hinzugefügt.`,
        });
      }
      
      // Reload all files to ensure consistency
      await loadDesignFiles();
    } catch (error) {
      console.error('❌ [useDesignFiles] Error uploading files:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Die Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    }
    
    // Clear the input but keep the dialog open
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
      
      // Don't close the dialog - keep it open
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Datei konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleFileDownload = async (file: UploadedFile) => {
    try {
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
        // For files stored in Supabase storage
        const { data, error } = await supabase.storage
          .from('design-files')
          .download(file.path);
        
        if (error) throw error;
        
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName || file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download erfolgreich",
          description: `${file.name} wurde heruntergeladen.`,
        });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download fehlgeschlagen",
        description: "Die Datei konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
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
