
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTempFileUpload } from './useTempFileUpload';

export interface SelectedFile {
  id: string;
  file: File;
  partId: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  tempPath?: string;
  finalPath?: string;
  isUploaded?: boolean;
  isMovedToFinal?: boolean;
}

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const { toast } = useToast();
  const { uploadToTemp, moveToFinal, cleanupTempFiles, removeTempFile } = useTempFileUpload();

  const addFiles = async (files: File[], partId: string, expectedType?: 'static' | 'personalizable') => {
    console.log('📁 [FileSelection] Adding files for part:', partId, 'type:', expectedType);
    
    const validFiles: SelectedFile[] = [];
    
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let fileCategory: 'CAD' | 'INI' | 'GCODE';
      let isValid = false;

      // Validate file types based on part type
      if (expectedType === 'static') {
        if (extension === 'gcode' || extension === 'g') {
          fileCategory = 'GCODE';
          isValid = true;
        } else {
          toast({
            title: "Falscher Dateityp",
            description: `Statische Parts benötigen G-Code Dateien (.gcode, .g). ${file.name} wurde ignoriert.`,
            variant: "destructive",
          });
        }
      } else if (expectedType === 'personalizable') {
        if (extension === 'f3d') {
          fileCategory = 'CAD';
          isValid = true;
        } else if (extension === 'ini') {
          fileCategory = 'INI';
          isValid = true;
        } else {
          toast({
            title: "Falscher Dateityp",
            description: `Personalisierbare Parts benötigen F3D (.f3d) oder INI (.ini) Dateien. ${file.name} wurde ignoriert.`,
            variant: "destructive",
          });
        }
      } else {
        // Generic handling
        if (extension === 'f3d') {
          fileCategory = 'CAD';
        } else if (extension === 'ini') {
          fileCategory = 'INI';
        } else if (extension === 'gcode' || extension === 'g') {
          fileCategory = 'GCODE';
        } else {
          fileCategory = 'CAD';
        }
        isValid = true;
      }

      if (isValid) {
        console.log('📤 [FileSelection] Uploading file to temp storage:', file.name);
        
        const tempFile = await uploadToTemp(file, partId, fileCategory);
        
        if (tempFile) {
          const selectedFile: SelectedFile = {
            id: tempFile.id,
            file,
            partId,
            fileCategory,
            tempPath: tempFile.tempPath,
            isUploaded: true,
            isMovedToFinal: false
          };

          validFiles.push(selectedFile);
          console.log('✅ [FileSelection] File uploaded to temp:', selectedFile.tempPath);
        }
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => {
        // Remove existing files of the same category for this part
        const filtered = prev.filter(f => 
          !(f.partId === partId && validFiles.some(vf => vf.fileCategory === f.fileCategory))
        );
        return [...filtered, ...validFiles];
      });

      toast({
        title: "Dateien temporär hochgeladen",
        description: `${validFiles.length} Datei(en) wurden temporär gespeichert.`,
      });
    }
  };

  const removeFile = async (fileId: string) => {
    console.log('🗑️ [FileSelection] Removing file:', fileId);
    
    const fileToRemove = selectedFiles.find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.tempPath) {
      // Remove from temp storage
      await removeTempFile(fileId);
    }
    
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFilesForPart = (partId: string): SelectedFile[] => {
    return selectedFiles.filter(f => f.partId === partId);
  };

  const getAllFiles = (): File[] => {
    return selectedFiles.map(f => f.file);
  };

  const clearAllFiles = async () => {
    console.log('🧹 [FileSelection] Clearing all files');
    await cleanupTempFiles();
    setSelectedFiles([]);
  };

  const moveFilesToFinal = async (productName: string) => {
    console.log('📦 [FileSelection] Moving files from temp to final destination');
    
    const movedFiles = [];
    
    for (const selectedFile of selectedFiles) {
      if (!selectedFile.tempPath || selectedFile.isMovedToFinal) {
        continue;
      }
      
      try {
        const sanitizedProductName = productName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const sanitizedPartName = selectedFile.partId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const finalPath = `Products/${sanitizedProductName}/${sanitizedPartName}/${selectedFile.file.name}`;
        
        console.log('📦 [FileSelection] Moving file:', selectedFile.file.name);
        
        const finalStoragePath = await moveToFinal(
          {
            id: selectedFile.id,
            name: selectedFile.file.name,
            tempPath: selectedFile.tempPath,
            file: selectedFile.file,
            category: selectedFile.fileCategory,
            partId: selectedFile.partId,
            uploadedAt: Date.now()
          },
          finalPath
        );
        
        if (finalStoragePath) {
          selectedFile.finalPath = finalStoragePath;
          selectedFile.isMovedToFinal = true;
          
          movedFiles.push({
            path: finalStoragePath,
            name: selectedFile.file.name,
            category: selectedFile.fileCategory,
            partName: selectedFile.partId
          });
          
          console.log('✅ [FileSelection] File moved successfully:', finalStoragePath);
        }
      } catch (error) {
        console.error('❌ [FileSelection] Failed to move file:', selectedFile.file.name, error);
        throw error;
      }
    }

    setSelectedFiles(prev => [...prev]);
    
    console.log('✅ [FileSelection] All files moved successfully:', movedFiles.length);
    return movedFiles;
  };

  return {
    selectedFiles,
    addFiles,
    removeFile,
    getFilesForPart,
    getAllFiles,
    clearAllFiles,
    moveFilesToFinal,
    uploading: false
  };
};
