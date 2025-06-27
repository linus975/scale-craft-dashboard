
import { useSimpleFileUpload } from './useSimpleFileUpload';

export const useDesignFileUpload = () => {
  const { uploadedFiles, uploading, uploadFile, removeFile, clearAllFiles } = useSimpleFileUpload();

  return {
    uploadedFiles,
    uploading,
    uploadFile,
    removeFile,
    clearAllFiles,
    previewImage: null // For compatibility
  };
};
