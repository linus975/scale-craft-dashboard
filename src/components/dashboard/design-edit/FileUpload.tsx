
import React from 'react';
import PartSpecificFileUpload from './PartSpecificFileUpload';

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
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile,
}) => {
  console.log(`🔄 [FileUpload] Wrapper for PART: "${partName}" (Type: ${partType})`);

  // Create a wrapper that ensures part-specific upload
  const handlePartSpecificUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`🎯 [FileUpload] Part-specific upload wrapper for PART: "${partName}"`);
    onFileUpload(event, partName);
  };

  const mappedPartType = partType === 'personalized' ? 'personalizable' : 'static';

  return (
    <PartSpecificFileUpload
      partName={partName}
      partId={partId}
      partType={mappedPartType}
      uploading={uploading}
      onFileUpload={handlePartSpecificUpload}
      uploadedFiles={uploadedFiles}
      gcodeFile={gcodeFile}
      onGcodeFileChange={onGcodeFileChange}
      onRemoveGcodeFile={onRemoveGcodeFile}
    />
  );
};

export default FileUpload;
