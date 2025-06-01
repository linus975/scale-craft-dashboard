
import React from 'react';
import MultiPartFileManager from './MultiPartFileManager';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
}

interface FileManagementProps {
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string) => void;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
}

const FileManagement: React.FC<FileManagementProps> = (props) => {
  return <MultiPartFileManager {...props} />;
};

export default FileManagement;
