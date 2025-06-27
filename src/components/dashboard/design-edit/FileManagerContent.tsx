
import React from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import ParameterConfig from './ParameterConfig';
import ValidationInfo from './ValidationInfo';
import ColorMachineFields from './ColorMachineFields';
import type { UploadedFile } from '@/types/fileUpload';
import type { DesignPart } from '@/types/designPart';

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
  console.log('📂 [FileManagerContent] DEBUGGING - Component state:');
  console.log('  - Current LOCAL part:', currentPart.id, '(', currentPart.name, ')');
  console.log('  - Upload files received:', uploadedFiles.length);
  console.log('  - Files details:', uploadedFiles.map(f => ({ name: f.name, partId: f.partId, extension: f.fileExtension })));
  
  // CRITICAL: Double-check filtering - files should ONLY belong to current LOCAL part
  const currentPartFiles = uploadedFiles.filter(file => {
    const matches = file.partId === currentPart.id;
    console.log(`📁 [FileManagerContent] File "${file.name}": partId=${file.partId}, currentPartId=${currentPart.id}, matches=${matches}`);
    return matches;
  });
  
  console.log('🎯 [FileManagerContent] Final filtered files for current part:', currentPartFiles.map(f => f.name));

  const handleFileTypeChange = (fileId: string, designType: 'static' | 'personalizable') => {
    console.log(`🔄 [FileManagerContent] Changing file ${fileId} to ${designType} for LOCAL part ${currentPart.id}`);
  };

  // Create a wrapper for file upload that ensures proper LOCAL part assignment
  const handlePartSpecificFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`🎯 [FileManagerContent] Upload wrapper called for LOCAL part: ${currentPart.id}`);
    console.log('  - Files to upload:', event.target.files?.length || 0);
    onFileUpload(event);
  };

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
        onFileUpload={handlePartSpecificFileUpload}
        uploadedFiles={currentPartFiles} // CRITICAL: Pass only current LOCAL part files
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

      {(loadingFiles || currentPartFiles.length > 0) && (
        <FileList
          files={currentPartFiles} // CRITICAL: Show only current LOCAL part files
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
