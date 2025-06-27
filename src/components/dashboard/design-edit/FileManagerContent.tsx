
import React from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import ParameterConfig from './ParameterConfig';
import ValidationInfo from './ValidationInfo';
import ColorMachineFields from './ColorMachineFields';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
  designType?: 'static' | 'personalizable';
}

interface DesignPart {
  id: string;
  name: string;
  files: UploadedFile[];
  partType?: 'static' | 'personalizable';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
  nozzleDiameter?: string;
  filamentType?: string;
  color?: string;
  machine?: string;
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
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType' | 'color' | 'machine', value: string) => void;
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
  machines?: Array<{ id: string; name: string }>;
  designParts?: DesignPart[];
  activePart?: string;
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
  onPartSpecificationChange,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile,
  machines = [],
  designParts = [],
  activePart
}) => {
  const handleFileTypeChange = (fileId: string, designType: 'static' | 'personalizable') => {
    console.log(`Changing file ${fileId} to ${designType}`);
  };

  console.log(`📂 FileManagerContent: Displaying ${uploadedFiles.length} files for part ${currentPart.id}`);

  return (
    <>
      <ValidationInfo
        partName={currentPart.name}
        hasPersonalizedFiles={validation.hasPersonalizedFiles}
        hasF3D={validation.hasF3D}
        hasINI={validation.hasINI}
      />

      <ColorMachineFields
        partId={currentPart.id}
        designParts={designParts}
        machines={machines}
        onPartSpecificationChange={onPartSpecificationChange}
      />

      <FileUpload
        partName={currentPart.name}
        partId={currentPart.id}
        partType={currentPart.partType === 'personalizable' ? 'personalized' : 'static'}
        uploading={uploading}
        onFileUpload={onFileUpload}
        uploadedFiles={uploadedFiles}
        onPartSpecificationChange={onPartSpecificationChange}
        gcodeFile={gcodeFile}
        onGcodeFileChange={onGcodeFileChange}
        onRemoveGcodeFile={onRemoveGcodeFile}
        currentPart={currentPart}
      />

      {currentPart.partType === 'personalizable' && (
        <ParameterConfig
          currentPart={currentPart}
          hasPersonalizedFiles={validation.hasPersonalizedFiles}
          onPartParametersChange={onPartParametersChange}
        />
      )}

      {(loadingFiles || uploadedFiles.length > 0) && (
        <FileList
          files={uploadedFiles}
          partName={currentPart.name}
          loadingFiles={loadingFiles}
          onFileRemove={onFileRemove}
          onFileDownload={onFileDownload}
          onFileTypeChange={(fileId: string, designType: 'static' | 'personalized') => {
            const mappedType = designType === 'personalized' ? 'personalizable' : 'static';
            handleFileTypeChange(fileId, mappedType);
          }}
        />
      )}
    </>
  );
};

export default FileManagerContent;
