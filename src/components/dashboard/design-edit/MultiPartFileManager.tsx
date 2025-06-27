
import React from 'react';
import PartManagementHeader from './PartManagementHeader';
import FileManagerContent from './FileManagerContent';
import { useMultiPartManager } from '@/hooks/useMultiPartManager';
import { organizeFilesByParts, validatePartFiles } from '@/utils/fileOrganization';

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

interface MultiPartFileManagerProps {
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string) => void;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
  onPartParametersChange?: (partId: string, parameters: { sketchName: string; replacementValue: string }) => void;
  selectedPartId?: string;
  onPartSelect?: (partId: string) => void;
  designParts?: DesignPart[];
  activePart?: string;
  onPartChange?: (partId: string) => void;
  onAddPart?: (name: string) => void;
  onRemovePart?: (partId: string) => void;
  onRenamePart?: (partId: string, newName: string) => void;
  onPartTypeChange?: (partId: string, partType: 'static' | 'personalizable') => void;
  onPartSoftwareChange?: (partId: string, field: 'cadSoftware' | 'slicer', value: string) => void;
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType' | 'color' | 'machine', value: string) => void;
  validatePartFiles?: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
  machines?: Array<{ id: string; name: string }>;
  gcodeFiles?: Record<string, File>;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>, partId: string) => void;
  onRemoveGcodeFile?: (partId: string) => void;
  getGcodeFileForPart?: (partId: string) => File | null;
}

const MultiPartFileManager: React.FC<MultiPartFileManagerProps> = ({
  uploadedFiles,
  loadingFiles,
  uploading,
  onFileUpload,
  onFileRemove,
  onFileDownload,
  onPartParametersChange,
  selectedPartId,
  onPartSelect,
  designParts: externalDesignParts,
  activePart: externalActivePart,
  onPartChange: externalOnPartChange,
  onAddPart: externalOnAddPart,
  onRemovePart: externalOnRemovePart,
  onRenamePart: externalOnRenamePart,
  onPartTypeChange: externalOnPartTypeChange,
  onPartSoftwareChange: externalOnPartSoftwareChange,
  onPartSpecificationChange,
  validatePartFiles: externalValidatePartFiles,
  machines = [],
  gcodeFiles,
  onGcodeFileChange,
  onRemoveGcodeFile,
  getGcodeFileForPart
}) => {
  const {
    designParts,
    activePart,
    addNewPart,
    removePart,
    renamePart,
    handlePartTypeChange,
    handlePartSoftwareChange,
    handlePartParametersChange,
    handlePartChange
  } = useMultiPartManager({
    externalDesignParts,
    externalActivePart,
    selectedPartId,
    onPartSelect
  });

  // WICHTIG: Verwende immer die activePart ID für File-Uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    console.log(`🎯 Uploading file for ACTIVE part: ${activePart}`);
    onFileUpload(event, activePart);
  };

  const organizedParts = organizeFilesByParts(designParts, uploadedFiles);
  const currentPart = organizedParts.find(part => part.id === activePart) || organizedParts[0];
  
  if (!currentPart) {
    console.log('❌ No current part found');
    return <div>No part selected</div>;
  }

  console.log(`📁 Current part: ${currentPart.name} (${currentPart.id})`);
  console.log(`📂 Files for current part:`, currentPart.files);
  
  const validation = currentPart ? 
    (externalValidatePartFiles ? externalValidatePartFiles(currentPart) : validatePartFiles(currentPart)) : 
    { hasF3D: false, hasINI: false, hasPersonalizedFiles: false };

  // Get G-code file for current part
  const currentPartGcodeFile = getGcodeFileForPart ? getGcodeFileForPart(activePart) : null;

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <PartManagementHeader
        designParts={designParts}
        activePart={activePart}
        onPartChange={(value) => {
          console.log(`🔄 Switching to part: ${value}`);
          handlePartChange(value, externalOnPartChange);
        }}
        onAddPart={(name) => addNewPart(name, externalOnAddPart)}
        onRemovePart={(partId) => removePart(partId, externalOnRemovePart)}
        onRenamePart={(partId, newName) => renamePart(partId, newName, externalOnRenamePart)}
        onPartTypeChange={(partId, partType) => handlePartTypeChange(partId, partType, externalOnPartTypeChange)}
        validatePartFiles={externalValidatePartFiles || validatePartFiles}
      />

      <FileManagerContent
        currentPart={currentPart}
        validation={validation}
        uploadedFiles={uploadedFiles}
        loadingFiles={loadingFiles}
        uploading={uploading}
        onFileUpload={handleFileUpload}
        onFileRemove={onFileRemove}
        onFileDownload={onFileDownload}
        onPartParametersChange={(partId, field, value) => 
          handlePartParametersChange(partId, field, value, onPartParametersChange)
        }
        onPartSpecificationChange={onPartSpecificationChange}
        gcodeFile={currentPartGcodeFile}
        onGcodeFileChange={onGcodeFileChange ? (event) => onGcodeFileChange(event, activePart) : undefined}
        onRemoveGcodeFile={onRemoveGcodeFile ? () => onRemoveGcodeFile(activePart) : undefined}
        machines={machines}
        designParts={designParts}
        activePart={activePart}
      />
    </div>
  );
};

export default MultiPartFileManager;
