
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
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
  currentPart?: {
    nozzleDiameter?: string;
    filamentType?: string;
  };
}

const FileUpload: React.FC<FileUploadProps> = ({
  partName,
  partId,
  uploading,
  partType = 'static',
  onFileUpload,
  uploadedFiles = [],
  onPartSpecificationChange,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile,
  currentPart
}) => {
  if (partType === 'personalized') {
    return (
      <PersonalizedPartUpload
        partName={partName}
        partId={partId}
        uploading={uploading}
        onFileUpload={onFileUpload}
        uploadedFiles={uploadedFiles}
        currentPart={currentPart}
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
      gcodeFile={gcodeFile}
      onGcodeFileChange={onGcodeFileChange}
      onRemoveGcodeFile={onRemoveGcodeFile}
      currentPart={currentPart}
      onPartSpecificationChange={onPartSpecificationChange}
    />
  );
};

export default FileUpload;
