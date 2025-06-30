
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSimpleUpload } from './useSimpleUpload';

export interface SelectedFile {
  id: string;
  file: File;
  partId: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  finalPath?: string; // Path in final storage
  isUploaded?: boolean; // Whether file is uploaded
}

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const { toast } = useToast();
  const { uploadFile } = useSimpleUpload();

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
          isUploaded: false
        };

        validFiles.push(selectedFile);
        console.log('✅ [FileSelection] File added to selection:', selectedFile.file.name);
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

      console.log('✅ [FileSelection] Added files to selection:', validFiles.map(f => f.file.name));
      
      toast({
        title: "Dateien ausgewählt",
        description: `${validFiles.length} Datei(en) wurden zur Auswahl hinzugefügt.`,
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
    setSelectedFiles([]);
  };

  // New function to upload files directly to final destination
  const uploadSelectedFiles = async (productName: string, partName: string) => {
    const filesToUpload = selectedFiles.filter(f => f.partId === partName && !f.isUploaded);
    
    if (filesToUpload.length === 0) {
      console.log('📤 [FileSelection] No files to upload for part:', partName);
      return [];
    }

    console.log('📤 [FileSelection] Uploading files directly to final destination:', filesToUpload.length);
    
    const uploadedFiles = [];
    for (const selectedFile of filesToUpload) {
      try {
        console.log('📤 [FileSelection] Uploading file:', selectedFile.file.name);
        const result = await uploadFile(selectedFile.file, productName, partName, selectedFile.fileCategory);
        
        // Update the selected file with upload info
        selectedFile.finalPath = result.path;
        selectedFile.isUploaded = true;
        
        uploadedFiles.push(result);
        console.log('✅ [FileSelection] File uploaded successfully:', result.path);
      } catch (error) {
        console.error('❌ [FileSelection] Failed to upload file:', selectedFile.file.name, error);
        throw error;
      }
    }

    // Update the state
    setSelectedFiles(prev => [...prev]);
    
    return uploadedFiles;
  };

  return {
    selectedFiles,
    addFiles,
    removeFile,
    getFilesForPart,
    getAllFiles,
    clearAllFiles,
    uploadSelectedFiles,
    uploading: false
  };
};
