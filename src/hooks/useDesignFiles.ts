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
  partId?: string; // This stores the part NAME, not the database ID
}

export const useDesignFiles = (design: any, isOpen: boolean) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const { uploadFile, getFileUrl, deleteFile, uploading } = useFileUpload();
  const { ensureTempPartsFolder, checkStorageStructure } = useStorageFolderManager();
  const { toast } = useToast();

  console.log('🎯 [useDesignFiles] Session ID:', sessionId);

  useEffect(() => {
    if (isOpen) {
      if (design?.id) {
        // Existing design - load from design-specific folders
        loadDesignFiles();
      } else {
        // New design - start with empty files but check storage
        console.log('🆕 [useDesignFiles] New design - starting with empty file list');
        setUploadedFiles([]);
      }
      checkStorageStructure();
    }
  }, [isOpen, design?.id, sessionId]);

  const extractOriginalFileName = (path: string, fallbackType: string): string => {
    if (!path) return fallbackType;
    
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    if (fileName.includes('.')) {
      const extension = fileName.split('.').pop();
      
      if (['f3d', 'step', 'stp', 'iges', 'igs', 'dwg', 'dxf'].includes(extension?.toLowerCase() || '')) {
        return `${design?.name || 'design'}.${extension}`;
      }
      
      if (extension?.toLowerCase() === 'gcode') {
        return `${design?.name || 'design'}.gcode`;
      }
      
      if (extension?.toLowerCase() === 'ini') {
        return `${design?.name || 'settings'}.ini`;
      }
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension?.toLowerCase() || '')) {
        return `${design?.name || 'preview'}.${extension}`;
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
    console.log('🔄 [useDesignFiles] Loading files for existing design:', design.id);
    
    try {
      const files: UploadedFile[] = [];
      
      // Load legacy files first (these belong to the "main" part)
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
          partId: 'main'
        });
      }

      if (design.design_type === 'static' && design.gcode && !design.gcode_file_path) {
        files.push({
          id: 'legacy_gcode',
          name: `${design.name || 'design'}.gcode`,
          type: 'G-Code (Legacy)',
          size: `${(design.gcode.length / 1024).toFixed(1)} KB`,
          uploadDate: new Date(design.created_at).toISOString().split('T')[0],
          path: '',
          originalName: `${design.name || 'design'}.gcode`,
          partId: 'main'
        });
      }
      
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
          partId: 'main'
        });
      }

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
          partId: 'main'
        });
      }

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
          partId: 'main'
        });
      }

      // Load files from storage bucket - organized by part
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('👤 [useDesignFiles] Loading files for user:', user.id);
          
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
                      partId: partFolder.name // CRITICAL: Store part folder name as partId
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, partName: string) => {
    const files = event.target.files;
    if (!files || !partName) {
      console.error('❌ [useDesignFiles] No files or partName provided');
      return;
    }

    console.log('🎯 [useDesignFiles] UPLOAD START for part:', partName);
    console.log('  - Files to upload:', files.length);
    console.log('  - Session ID:', sessionId);
    console.log('  - Is existing design:', !!design?.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      for (const file of Array.from(files)) {
        console.log(`📤 [useDesignFiles] Uploading file: ${file.name} to part: ${partName}`);
        
        // FIXED: Create correct folder path for temp-parts
        const folderPath = `temp-parts/${partName}`;
        
        console.log('📁 [useDesignFiles] Upload folder path:', folderPath);
        console.log('🔍 [useDesignFiles] Expected storage path:', `${user.id}/${folderPath}/${file.name}`);
        
        const uploadPath = await uploadFile(file, folderPath);
        
        console.log(`✅ [useDesignFiles] File uploaded successfully to:`, uploadPath);
        
        const newFile: UploadedFile = {
          id: `${partName}-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: uploadPath,
          originalName: file.name,
          partId: partName // Store part name as partId
        };
        
        console.log('✅ [useDesignFiles] New file created for part:', { name: file.name, partId: partName });
        
        // Add file to state immediately for this specific part
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
      
    } catch (error) {
      console.error('❌ [useDesignFiles] Error uploading files:', error);
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

  // Function to get files for a specific part
  const getFilesForPart = (partName: string): UploadedFile[] => {
    const partFiles = uploadedFiles.filter(file => file.partId === partName);
    console.log(`📋 [useDesignFiles] Getting files for part "${partName}":`, partFiles.map(f => f.name));
    return partFiles;
  };

  // Function to move files from temp session to permanent design folder
  const moveFilesToDesign = async (designId: string): Promise<void> => {
    if (design?.id) return; // Already a saved design
    
    console.log('🔄 [useDesignFiles] Moving files from temp session to design:', designId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updatedFiles: UploadedFile[] = [];
      
      for (const file of uploadedFiles) {
        if (file.path.includes(`temp-session/${sessionId}`)) {
          // Move file from temp to permanent location
          const newPath = file.path.replace(
            `temp-session/${sessionId}`,
            `designs/${designId}`
          );
          
          // Copy file to new location
          const { data: fileData } = await supabase.storage
            .from('design-files')
            .download(file.path);
          
          if (fileData) {
            await supabase.storage
              .from('design-files')
              .upload(newPath, fileData);
            
            // Delete old file
            await supabase.storage
              .from('design-files')
              .remove([file.path]);
            
            updatedFiles.push({
              ...file,
              path: newPath
            });
          }
        } else {
          updatedFiles.push(file);
        }
      }
      
      setUploadedFiles(updatedFiles);
      console.log('✅ [useDesignFiles] Files moved successfully');
    } catch (error) {
      console.error('❌ [useDesignFiles] Error moving files:', error);
    }
  };

  return {
    uploadedFiles,
    loadingFiles,
    uploading,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload,
    getFilesForPart,
    moveFilesToDesign,
    sessionId
  };
};
