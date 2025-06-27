
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
}

export const useDesignFiles = (design: any, isOpen: boolean) => {
  const { uploadedFiles, uploading, uploadFile, removeFile } = useSimpleFileUpload();
  const [loadingFiles, setLoadingFiles] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await uploadFile(file);
    }

    // Clear input
    event.target.value = '';
  };

  const handleFileRemove = (file: UploadedFile) => {
    removeFile(file.id);
  };

  const handleFileDownload = (file: UploadedFile) => {
    console.log('Downloading file:', file.name);
  };

  const getFilesForPart = (partId: string): UploadedFile[] => {
    return uploadedFiles;
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
