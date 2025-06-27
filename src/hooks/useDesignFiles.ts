
import { useState, useEffect } from 'react';
import { useSimpleFileUpload } from './useSimpleFileUpload';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  partId?: string;
}

export const useDesignFiles = (design: any, isOpen: boolean) => {
  const { uploadedFiles, uploading, uploadFile, removeFile } = useSimpleFileUpload();
  const [loadingFiles, setLoadingFiles] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    console.log('🔄 [DesignFiles] Starting file upload, files count:', files.length);
    
    for (const file of Array.from(files)) {
      console.log('📤 [DesignFiles] Uploading file:', file.name);
      await uploadFile(file);
    }

    // Clear input
    event.target.value = '';
  };

  const handleFileRemove = (file: UploadedFile) => {
    console.log('🗑️ [DesignFiles] Removing file:', file.name);
    removeFile(file.id);
  };

  const handleFileDownload = (file: UploadedFile) => {
    console.log('📥 [DesignFiles] Downloading file:', file.name);
    // Implementation for file download would go here
  };

  const getFilesForPart = (partId: string): UploadedFile[] => {
    const filteredFiles = uploadedFiles.filter(file => file.partId === partId);
    console.log(`📁 [DesignFiles] Files for part "${partId}":`, filteredFiles.length);
    return filteredFiles;
  };

  return {
    uploadedFiles,
    loadingFiles,
    uploading,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload,
    getFilesForPart
  };
};
