
import { useFileUploadManager } from './useFileUploadManager';
import { useGcodeFileManager } from './useGcodeFileManager';

export const usePartSpecificFileUpload = () => {
  const fileUploadManager = useFileUploadManager();
  const gcodeManager = useGcodeFileManager();

  return {
    ...fileUploadManager,
    ...gcodeManager
  };
};
