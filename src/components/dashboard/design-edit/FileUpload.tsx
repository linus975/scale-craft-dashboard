
import React from 'react';
import PersonalizedPartUpload from './PersonalizedPartUpload';
import StaticPartUpload from './StaticPartUpload';

interface FileUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  partType?: 'static' | 'personalized';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles?: any[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  partName,
  partId,
  uploading,
  partType = 'static',
  onFileUpload,
  uploadedFiles = []
}) => {
  if (partType === 'personalized') {
    return (
      <PersonalizedPartUpload
        partName={partName}
        partId={partId}
        uploading={uploading}
        onFileUpload={onFileUpload}
        uploadedFiles={uploadedFiles}
      />
    );
  }

  return (
    <StaticPartUpload
      partName={partName}
      partId={partId}
      uploading={uploading}
      onFileUpload={onFileUpload}
      uploadedFiles={uploadedFiles}
    />
  );
};

export default FileUpload;
