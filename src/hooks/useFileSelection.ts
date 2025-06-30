
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTempFileUpload } from './useTempFileUpload';

export interface SelectedFile {
  id: string;
  file: File;
  partId: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  tempPath?: string; // Path in temp storage
  finalPath?: string; // Path in final storage
  isUploaded?: boolean; // Whether file is uploaded to temp
  isMovedToFinal?: boolean; // Whether file is moved to final location
}

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const { toast } = useToast();
  const { uploadToTemp, moveToFinal, cleanupTempFiles } = useTempFileUpload();

  const addFiles = async (files: File[], partId: string, expectedType?: 'static' | 'personalizable') => {
    console.log('📁 [FileSelection] Adding files for part:', partId, 'type:', expectedType);
    console.log('📁 [FileSelection] Files to add:', files.map(f => f.name));
    
    const validFiles: SelectedFile[] = [];
    
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let fileCategory: 'CAD' | 'INI' | 'GCODE';
      let isValid = false;

      // Validate file types based on part type
      if (expectedType === 'static') {
        // Static parts: only G-Code files
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
        // Personalizable parts: F3D and INI files
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
        // Generic handling if no type specified
        if (extension === 'f3d') {
          fileCategory = 'CAD';
        } else if (extension === 'ini') {
          fileCategory = 'INI';
        } else if (extension === 'gcode' || extension === 'g') {
          fileCategory = 'GCODE';
        } else {
          fileCategory = 'CAD'; // Default fallback
        }
        isValid = true;
      }

      if (isValid) {
        console.log('📤 [FileSelection] Uploading file to temp storage:', file.name);
        
        // Upload to temp storage immediately
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
        const newSelection = [...filtered, ...validFiles];
        console.log('✅ [FileSelection] Updated selection. Total files:', newSelection.length);
        return newSelection;
      });

      toast({
        title: "Dateien temporär hochgeladen",
        description: `${validFiles.length} Datei(en) wurden temporär gespeichert.`,
      });
    }
  };

  const removeFile = async (fileId: string) => {
    console.log('🗑️ [FileSelection] Removing file:', fileId);
    
    setSelectedFiles(prev => {
      const newSelection = prev.filter(f => f.id !== fileId);
      console.log('🗑️ [FileSelection] Remaining files:', newSelection.length);
      return newSelection;
    });
  };

  const getFilesForPart = (partId: string): SelectedFile[] => {
    const partFiles = selectedFiles.filter(f => f.partId === partId);
    console.log('📂 [FileSelection] Files for part', partId, ':', partFiles.length);
    return partFiles;
  };

  const getAllFiles = (): File[] => {
    const allFiles = selectedFiles.map(f => f.file);
    console.log('📂 [FileSelection] All selected files:', allFiles.length);
    return allFiles;
  };

  const clearAllFiles = async () => {
    console.log('🧹 [FileSelection] Clearing all files');
    await cleanupTempFiles();
    setSelectedFiles([]);
  };

  // Move files from temp to final destination
  const moveFilesToFinal = async (productName: string) => {
    console.log('📦 [FileSelection] Moving files from temp to final destination');
    console.log('📦 [FileSelection] Product name:', productName);
    console.log('📦 [FileSelection] Files to move:', selectedFiles.length);
    
    const movedFiles = [];
    
    for (const selectedFile of selectedFiles) {
      if (!selectedFile.tempPath || selectedFile.isMovedToFinal) {
        console.log('⏭️ [FileSelection] Skipping file (already moved or no temp path):', selectedFile.file.name);
        continue;
      }
      
      try {
        // Create final path: {userid}/Products/{productName}/{partName}/{filename}
        const sanitizedProductName = productName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const sanitizedPartName = selectedFile.partId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const finalPath = `Products/${sanitizedProductName}/${sanitizedPartName}/${selectedFile.file.name}`;
        
        console.log('📦 [FileSelection] Moving file:', selectedFile.file.name);
        console.log('📦 [FileSelection] From temp:', selectedFile.tempPath);
        console.log('📦 [FileSelection] To final:', finalPath);
        
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
          // Update the selected file with final path
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

    // Update the state
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
