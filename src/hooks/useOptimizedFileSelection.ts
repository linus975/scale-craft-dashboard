
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFastTempUpload } from './useFastTempUpload';

export interface OptimizedSelectedFile {
  id: string;
  file: File;
  partId: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  tempPath?: string;
  finalPath?: string;
  isUploaded?: boolean;
  isMovedToFinal?: boolean;
}

export const useOptimizedFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<OptimizedSelectedFile[]>([]);
  const { toast } = useToast();
  const { uploadToTemp, moveToFinal, cleanupTempFiles, removeTempFile } = useFastTempUpload();

  const addFiles = async (files: File[], partId: string, expectedType?: 'static' | 'personalizable') => {
    console.log('⚡ [OptimizedFileSelection] Fast file processing:', files.length, 'files');
    
    const validFiles: OptimizedSelectedFile[] = [];
    
    // Process files in parallel for speed
    const uploadPromises = files.map(async (file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let fileCategory: 'CAD' | 'INI' | 'GCODE';
      let isValid = false;

      // Quick validation
      if (expectedType === 'static') {
        if (extension === 'gcode' || extension === 'g') {
          fileCategory = 'GCODE';
          isValid = true;
        }
      } else if (expectedType === 'personalizable') {
        if (extension === 'f3d') {
          fileCategory = 'CAD';
          isValid = true;
        } else if (extension === 'ini') {
          fileCategory = 'INI';
          isValid = true;
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
        console.log('⚡ [OptimizedFileSelection] Fast uploading:', file.name);
        
        const tempFile = await uploadToTemp(file, partId, fileCategory);
        
        if (tempFile) {
          return {
            id: tempFile.id,
            file,
            partId,
            fileCategory,
            tempPath: tempFile.tempPath,
            isUploaded: true,
            isMovedToFinal: false
          };
        }
      }
      return null;
    });

    const results = await Promise.allSettled(uploadPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        validFiles.push(result.value);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => {
        const filtered = prev.filter(f => 
          !(f.partId === partId && validFiles.some(vf => vf.fileCategory === f.fileCategory))
        );
        return [...filtered, ...validFiles];
      });

      toast({
        title: "Dateien hochgeladen",
        description: `${validFiles.length} Datei(en) wurden schnell hochgeladen.`,
      });
    }
  };

  const removeFile = async (fileId: string) => {
    console.log('⚡ [OptimizedFileSelection] Fast removing file:', fileId);
    
    const fileToRemove = selectedFiles.find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.tempPath) {
      await removeTempFile(fileId);
    }
    
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFilesForPart = (partId: string): OptimizedSelectedFile[] => {
    return selectedFiles.filter(f => f.partId === partId);
  };

  const getAllFiles = (): File[] => {
    return selectedFiles.map(f => f.file);
  };

  const clearAllFiles = async () => {
    console.log('⚡ [OptimizedFileSelection] Fast clearing all files');
    await cleanupTempFiles();
    setSelectedFiles([]);
  };

  const moveFilesToFinal = async (productName: string) => {
    console.log('⚡ [OptimizedFileSelection] Fast moving files to final');
    
    const movedFiles = [];
    
    // Process moves in parallel for speed
    const movePromises = selectedFiles.map(async (selectedFile) => {
      if (!selectedFile.tempPath || selectedFile.isMovedToFinal) {
        return null;
      }
      
      try {
        const sanitizedProductName = productName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const sanitizedPartName = selectedFile.partId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const finalPath = `Products/${sanitizedProductName}/${sanitizedPartName}/${selectedFile.file.name}`;
        
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
          
          return {
            path: finalStoragePath,
            name: selectedFile.file.name,
            category: selectedFile.fileCategory,
            partName: selectedFile.partId
          };
        }
      } catch (error) {
        console.error('❌ [OptimizedFileSelection] Move failed:', selectedFile.file.name, error);
        throw error;
      }
      return null;
    });

    const results = await Promise.allSettled(movePromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        movedFiles.push(result.value);
      }
    });

    setSelectedFiles(prev => [...prev]);
    
    console.log('⚡ [OptimizedFileSelection] Fast move completed:', movedFiles.length);
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
