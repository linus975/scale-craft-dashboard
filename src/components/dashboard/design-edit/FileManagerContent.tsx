
import React from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import ParameterConfig from './ParameterConfig';
import ValidationInfo from './ValidationInfo';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
  designType?: 'static' | 'personalized';
}

interface DesignPart {
  id: string;
  name: string;
  files: UploadedFile[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
}

interface FileManagerContentProps {
  currentPart: DesignPart;
  validation: { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
  onPartParametersChange: (partId: string, field: string, value: string) => void;
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
}

const FileManagerContent: React.FC<FileManagerContentProps> = ({
  currentPart,
  validation,
  uploadedFiles,
  loadingFiles,
  uploading,
  onFileUpload,
  onFileRemove,
  onFileDownload,
  onPartParametersChange,
  onPartSpecificationChange
}) => {
  const handleFileTypeChange = (fileId: string, designType: 'static' | 'personalized') => {
    console.log(`Changing file ${fileId} to ${designType}`);
  };

  return (
    <>
      <ValidationInfo
        partName={currentPart.name}
        hasPersonalizedFiles={validation.hasPersonalizedFiles}
        hasF3D={validation.hasF3D}
        hasINI={validation.hasINI}
      />

      <FileUpload
        partName={currentPart.name}
        partId={currentPart.id}
        partType={currentPart.partType}
        uploading={uploading}
        onFileUpload={onFileUpload}
        uploadedFiles={uploadedFiles}
        onPartSpecificationChange={onPartSpecificationChange}
      />

      <ParameterConfig
        currentPart={currentPart}
        hasPersonalizedFiles={validation.hasPersonalizedFiles}
        onPartParametersChange={onPartParametersChange}
      />

      {(loadingFiles || currentPart.files.length > 0) && (
        <FileList
          files={currentPart.files}
          partName={currentPart.name}
          loadingFiles={loadingFiles}
          onFileRemove={onFileRemove}
          onFileDownload={onFileDownload}
          onFileTypeChange={handleFileTypeChange}
        />
      )}
    </>
  );
};

export default FileManagerContent;
