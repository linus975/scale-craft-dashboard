
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDirectStorageUpload } from '@/hooks/useDirectStorageUpload';

export interface SelectedFile {
  id: string;
  file: File;
  partId: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  uploaded?: boolean;
  storagePath?: string;
}

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const { toast } = useToast();
  const { uploadFileToStorage } = useDirectStorageUpload();

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
        const selectedFile: SelectedFile = {
          id: `${partId}-${Date.now()}-${Math.random()}`,
          file,
          partId,
          fileCategory,
          uploaded: false
        };
        validFiles.push(selectedFile);
        console.log('✅ [FileSelection] Valid file added:', selectedFile.file.name, 'Category:', selectedFile.fileCategory);
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
        console.log('✅ [FileSelection] Selection details:', newSelection.map(f => `${f.file.name} (${f.fileCategory})`));
        return newSelection;
      });

      console.log('✅ [FileSelection] Added files:', validFiles.map(f => f.file.name));
      
      toast({
        title: "Dateien hinzugefügt",
        description: `${validFiles.length} Datei(en) wurden zur Auswahl hinzugefügt.`,
      });
    }
  };

  const uploadSelectedFiles = async (productName: string) => {
    console.log('🚀 [FileSelection] Starting upload of selected files to storage...');
    const uploadPromises = selectedFiles.map(async (selectedFile) => {
      if (selectedFile.uploaded) {
        console.log('⏭️ [FileSelection] File already uploaded:', selectedFile.file.name);
        return selectedFile;
      }

      try {
        console.log(`📤 [FileSelection] Uploading ${selectedFile.file.name} to storage...`);
        const uploadedFile = await uploadFileToStorage(
          selectedFile.file,
          productName,
          selectedFile.partId,
          selectedFile.partId, // Using partId as partName for now
          selectedFile.fileCategory
        );

        const updatedFile: SelectedFile = {
          ...selectedFile,
          uploaded: true,
          storagePath: uploadedFile.path
        };

        console.log(`✅ [FileSelection] File uploaded successfully: ${selectedFile.file.name} -> ${uploadedFile.path}`);
        return updatedFile;
      } catch (error) {
        console.error(`❌ [FileSelection] Upload failed for ${selectedFile.file.name}:`, error);
        throw error;
      }
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      setSelectedFiles(uploadedFiles);
      console.log('✅ [FileSelection] All files uploaded successfully to storage');
      return uploadedFiles;
    } catch (error) {
      console.error('❌ [FileSelection] Upload process failed:', error);
      throw error;
    }
  };

  const removeFile = (fileId: string) => {
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

  const clearAllFiles = () => {
    console.log('🧹 [FileSelection] Clearing all files');
    setSelectedFiles([]);
  };

  return {
    selectedFiles,
    addFiles,
    removeFile,
    getFilesForPart,
    getAllFiles,
    clearAllFiles,
    uploadSelectedFiles
  };
};
