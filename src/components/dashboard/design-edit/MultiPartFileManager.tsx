import React from 'react';
import PartManagementHeader from './PartManagementHeader';
import FileManagerContent from './FileManagerContent';
import { useMultiPartManager } from '@/hooks/useMultiPartManager';
import { organizeFilesByParts, validatePartFiles } from '@/utils/fileOrganization';
import type { UploadedFile } from '@/types/fileUpload';
import type { DesignPart } from '@/types/designPart';

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

  // CRITICAL: Ensure file upload is always targeted to the active part
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    console.log(`🎯 CRITICAL: MultiPartFileManager uploading to ACTIVE part: ${activePart}`);
    console.log(`📝 Event target files:`, event.target.files?.length || 0);
    
    // Always pass the current active part to ensure proper file assignment
    onFileUpload(event, activePart);
  };

  const organizedParts = organizeFilesByParts(designParts, uploadedFiles);
  const currentPart = organizedParts.find(part => part.id === activePart) || organizedParts[0];
  
  if (!currentPart) {
    console.log('❌ No current part found');
    return <div>No part selected</div>;
  }

  console.log(`📋 MultiPartFileManager - Active part: ${activePart}`);
  console.log(`📂 Current part: ${currentPart.name} (${currentPart.id})`);
  
  // CRITICAL: Filter files to show ONLY files for the current active part
  const currentPartFiles = uploadedFiles.filter(file => {
    const belongsToCurrentPart = file.partId === currentPart.id;
    console.log(`📁 File ${file.name}: partId=${file.partId}, currentPartId=${currentPart.id}, belongs=${belongsToCurrentPart}`);
    return belongsToCurrentPart;
  });
  
  console.log(`🎯 Filtered files for part ${currentPart.id}:`, currentPartFiles.map(f => f.name));
  
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
          console.log(`🔄 Switching from part ${activePart} to part: ${value}`);
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
        uploadedFiles={currentPartFiles} // CRITICAL: Pass only files for current part
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
