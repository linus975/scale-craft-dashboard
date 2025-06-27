
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
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partName?: string) => void;
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

  console.log('🔍 [MultiPartFileManager] DEBUGGING - Current state:');
  console.log('📋 Available parts:', designParts.map(p => ({ id: p.id, name: p.name })));
  console.log('🎯 Active part ID:', activePart);
  console.log('📁 Total uploaded files:', uploadedFiles.length);
  
  // Find current part and get its name for file operations
  const currentPart = designParts.find(part => part.id === activePart) || designParts[0];
  
  if (!currentPart) {
    console.error('❌ [MultiPartFileManager] No current part found');
    return <div>No part selected</div>;
  }

  const currentPartName = currentPart.name;
  console.log('📋 [MultiPartFileManager] Current part details:');
  console.log('  - ID:', currentPart.id);
  console.log('  - NAME:', currentPartName);
  console.log('  - Type:', currentPart.partType);

  // FIXED: Use part name for file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    console.log('🎯 [MultiPartFileManager] UPLOAD TRIGGERED for part NAME:', currentPartName);
    console.log('  - Files to upload:', event.target.files?.length || 0);
    
    if (!currentPartName) {
      console.error('❌ [MultiPartFileManager] No current part name - cannot upload!');
      return;
    }
    
    // FIXED: Pass the current part NAME to ensure proper file assignment
    console.log('✅ [MultiPartFileManager] Calling onFileUpload with partName:', currentPartName);
    onFileUpload(event, currentPartName);
  };

  // STRICT: Filter files by exact part name match
  const currentPartFiles = uploadedFiles.filter(file => {
    const belongsToCurrentPart = file.partId === currentPartName;
    console.log(`📁 [MultiPartFileManager] File "${file.name}": partId=${file.partId}, currentPartName=${currentPartName}, belongs=${belongsToCurrentPart}`);
    return belongsToCurrentPart;
  });
  
  console.log('🎯 [MultiPartFileManager] Filtered files for current part:', currentPartFiles.map(f => f.name));
  
  const validation = currentPart ? 
    (externalValidatePartFiles ? externalValidatePartFiles(currentPart) : validatePartFiles(currentPart)) : 
    { hasF3D: false, hasINI: false, hasPersonalizedFiles: false };

  console.log('✅ [MultiPartFileManager] Validation result:', validation);

  // Get G-code file for current part
  const currentPartGcodeFile = getGcodeFileForPart ? getGcodeFileForPart(activePart) : null;

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <PartManagementHeader
        designParts={designParts}
        activePart={activePart}
        onPartChange={(value) => {
          console.log('🔄 [MultiPartFileManager] Part change requested from', activePart, 'to', value);
          handlePartChange(value, externalOnPartChange);
        }}
        onAddPart={(name) => {
          console.log('➕ [MultiPartFileManager] Adding new part:', name);
          addNewPart(name, externalOnAddPart);
        }}
        onRemovePart={(partId) => {
          console.log('🗑️ [MultiPartFileManager] Removing part:', partId);
          removePart(partId, externalOnRemovePart);
        }}
        onRenamePart={(partId, newName) => {
          console.log('✏️ [MultiPartFileManager] Renaming part:', partId, 'to', newName);
          renamePart(partId, newName, externalOnRenamePart);
        }}
        onPartTypeChange={(partId, partType) => {
          console.log('🔄 [MultiPartFileManager] Changing part type:', partId, 'to', partType);
          handlePartTypeChange(partId, partType, externalOnPartTypeChange);
        }}
        validatePartFiles={externalValidatePartFiles || validatePartFiles}
      />

      <FileManagerContent
        currentPart={currentPart}
        validation={validation}
        uploadedFiles={currentPartFiles} // FIXED: Pass only files for current PART NAME
        loadingFiles={loadingFiles}
        uploading={uploading}
        onFileUpload={handleFileUpload}
        onFileRemove={onFileRemove}
        onFileDownload={onFileDownload}
        onPartParametersChange={(partId, field, value) => {
          console.log('⚙️ [MultiPartFileManager] Parameter change:', partId, field, value);
          handlePartParametersChange(partId, field, value, onPartParametersChange);
        }}
        onPartSpecificationChange={onPartSpecificationChange}
        gcodeFile={currentPartGcodeFile}
        onGcodeFileChange={onGcodeFileChange ? (event) => {
          console.log('📤 [MultiPartFileManager] G-code upload for part:', activePart);
          onGcodeFileChange(event, activePart);
        } : undefined}
        onRemoveGcodeFile={onRemoveGcodeFile ? () => {
          console.log('🗑️ [MultiPartFileManager] G-code removal for part:', activePart);
          onRemoveGcodeFile(activePart);
        } : undefined}
        machines={machines}
        designParts={designParts}
        activePart={activePart}
      />
    </div>
  );
};

export default MultiPartFileManager;
