
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SelectedFile {
  id: string;
  file: File;
  partId: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
}

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const { toast } = useToast();

  const addFiles = (files: File[], partId: string, expectedType?: 'static' | 'personalizable') => {
    console.log('📁 [FileSelection] Adding files for part:', partId, 'type:', expectedType);
    
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
          fileCategory
        };
        validFiles.push(selectedFile);
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

      console.log('✅ [FileSelection] Added files:', validFiles.map(f => f.file.name));
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFilesForPart = (partId: string): SelectedFile[] => {
    return selectedFiles.filter(f => f.partId === partId);
  };

  const getAllFiles = (): File[] => {
    return selectedFiles.map(f => f.file);
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  return {
    selectedFiles,
    addFiles,
    removeFile,
    getFilesForPart,
    getAllFiles,
    clearAllFiles
  };
};
