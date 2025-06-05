
import React from 'react';
import PartSelector from './PartSelector';
import ColorMachineFields from './ColorMachineFields';
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
  onPartTypeChange?: (partId: string, partType: 'static' | 'personalized') => void;
  onPartSoftwareChange?: (partId: string, field: 'cadSoftware' | 'slicer', value: string) => void;
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType', value: string) => void;
  validatePartFiles?: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
  colorValue?: string;
  machineValue?: string;
  onColorChange?: (value: string) => void;
  onMachineChange?: (value: string) => void;
  machines?: Array<{ id: string; name: string }>;
  formControl?: any;
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
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
  colorValue,
  machineValue,
  onColorChange,
  onMachineChange,
  machines = [],
  formControl,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event, activePart);
  };

  const organizedParts = organizeFilesByParts(designParts, uploadedFiles);
  const currentPart = organizedParts.find(part => part.id === activePart) || organizedParts[0];
  
  const validation = currentPart ? 
    (externalValidatePartFiles ? externalValidatePartFiles(currentPart) : validatePartFiles(currentPart)) : 
    { hasF3D: false, hasINI: false, hasPersonalizedFiles: false };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <PartSelector
        designParts={designParts}
        activePart={activePart}
        onPartChange={(value) => handlePartChange(value, externalOnPartChange)}
        onAddPart={(name) => addNewPart(name, externalOnAddPart)}
        onRemovePart={(partId) => removePart(partId, externalOnRemovePart)}
        onRenamePart={(partId, newName) => renamePart(partId, newName, externalOnRenamePart)}
        onPartTypeChange={(partId, partType) => handlePartTypeChange(partId, partType, externalOnPartTypeChange)}
        onPartSoftwareChange={(partId, field, value) => handlePartSoftwareChange(partId, field, value, externalOnPartSoftwareChange)}
        validatePartFiles={externalValidatePartFiles || validatePartFiles}
      />

      <ColorMachineFields
        colorValue={colorValue}
        machineValue={machineValue}
        formControl={formControl}
        machines={machines}
        onColorChange={onColorChange}
        onMachineChange={onMachineChange}
      />

      {currentPart && (
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
          gcodeFile={gcodeFile}
          onGcodeFileChange={onGcodeFileChange}
          onRemoveGcodeFile={onRemoveGcodeFile}
        />
      )}
    </div>
  );
};

export default MultiPartFileManager;
