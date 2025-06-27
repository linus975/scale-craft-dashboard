
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
  console.log('📂 [FileManagerContent] CURRENT PART FOCUS:');
  console.log('  - Part ID:', currentPart.id);
  console.log('  - Part NAME:', currentPart.name);
  console.log('  - Part Type:', currentPart.partType);
  console.log('  - All files count:', uploadedFiles.length);
  
  // STRICT filtering: Only files that belong to this EXACT part name
  const currentPartFiles = uploadedFiles.filter(file => {
    const isMatch = file.partId === currentPart.name;
    if (!isMatch) {
      console.log(`❌ [FileManagerContent] File "${file.name}" belongs to "${file.partId}", not "${currentPart.name}"`);
    } else {
      console.log(`✅ [FileManagerContent] File "${file.name}" belongs to current part "${currentPart.name}"`);
    }
    return isMatch;
  });
  
  console.log(`🎯 [FileManagerContent] Final files for part "${currentPart.name}":`, currentPartFiles.map(f => f.name));

  const handleFileTypeChange = (fileId: string, designType: 'static' | 'personalizable') => {
    console.log(`🔄 [FileManagerContent] File type change for "${fileId}" to "${designType}" in part "${currentPart.name}"`);
  };

  const handlePartSpecificFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`🎯 [FileManagerContent] UPLOAD INITIATED for part "${currentPart.name}"`);
    console.log('  - Files selected:', event.target.files?.length || 0);
    onFileUpload(event);
  };

  return (
    <div className="space-y-6">
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
        uploadedFiles={currentPartFiles}
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
          files={currentPartFiles}
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
    </div>
  );
};

export default FileManagerContent;
