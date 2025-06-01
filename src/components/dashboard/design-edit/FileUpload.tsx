
import React from 'react';
import PersonalizedPartUpload from './PersonalizedPartUpload';
import StaticPartUpload from './StaticPartUpload';

interface FileUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  partType?: 'static' | 'personalized';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string, expectedFileType?: 'f3d' | 'ini' | 'gcode') => void;
  uploadedFiles?: any[];
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  partName,
  partId,
  uploading,
  partType = 'static',
  onFileUpload,
  uploadedFiles = [],
  onPartSpecificationChange
}) => {
  if (partType === 'personalized') {
    return (
      <PersonalizedPartUpload
        partName={partName}
        partId={partId}
        uploading={uploading}
        onFileUpload={onFileUpload}
        uploadedFiles={uploadedFiles}
        onPartSpecificationChange={onPartSpecificationChange}
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
      onPartSpecificationChange={onPartSpecificationChange}
    />
  );
};

export default FileUpload;
