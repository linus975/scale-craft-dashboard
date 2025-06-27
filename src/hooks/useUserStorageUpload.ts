
import { useStorageUpload } from '@/hooks/storage/useStorageUpload';
import { useFileMover } from '@/hooks/storage/useFileMover';

export const useUserStorageUpload = () => {
  const { uploading, uploadToTemporary } = useStorageUpload();
  const { moveToFinalLocation } = useFileMover();

  return {
    uploading,
    uploadToTemporary,
    moveToFinalLocation
  };
};
