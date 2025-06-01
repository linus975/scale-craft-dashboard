
import React, { useState } from 'react';
import PartSelector from './PartSelector';
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
  // Add missing props that AddDesignForm is trying to pass
  designParts?: DesignPart[];
  activePart?: string;
  onPartChange?: (partId: string) => void;
  onAddPart?: (name: string) => void;
  onRemovePart?: (partId: string) => void;
  onRenamePart?: (partId: string, newName: string) => void;
  onPartTypeChange?: (partId: string, partType: 'static' | 'personalized') => void;
  onPartSoftwareChange?: (partId: string, field: 'cadSoftware' | 'slicer', value: string) => void;
  validatePartFiles?: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
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
  validatePartFiles: externalValidatePartFiles,
}) => {
  // Use external design parts if provided, otherwise use internal state
  const [internalDesignParts, setInternalDesignParts] = useState<DesignPart[]>([
    { 
      id: 'part1', 
      name: 'Teil 1', 
      files: [], 
      partType: 'static', 
      parameters: { sketchName: '', replacementValue: '', replacementType: 'text' },
      cadSoftware: '',
      slicer: ''
    }
  ]);
  const [internalActivePart, setInternalActivePart] = useState(selectedPartId || 'part1');

  // Use external props if available, otherwise use internal state
  const designParts = externalDesignParts || internalDesignParts;
  const activePart = externalActivePart || internalActivePart;

  // Organize files by parts
  const organizeFilesByParts = () => {
    const organizedParts = designParts.map(part => ({
      ...part,
      files: uploadedFiles.filter(file => file.partId === part.id || (!file.partId && part.id === 'part1'))
    }));
    return organizedParts;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event, activePart);
  };

  const addNewPart = (name: string) => {
    if (externalOnAddPart) {
      externalOnAddPart(name);
    } else {
      const newPart: DesignPart = {
        id: `part-${Date.now()}`,
        name: name,
        files: [],
        partType: 'static',
        parameters: { sketchName: '', replacementValue: '', replacementType: 'text' },
        cadSoftware: '',
        slicer: ''
      };
      setInternalDesignParts(prev => [...prev, newPart]);
      setInternalActivePart(newPart.id);
      
      if (onPartSelect) {
        onPartSelect(newPart.id);
      }
    }
  };

  const removePart = (partId: string) => {
    if (designParts.length <= 1) return; // Keep at least one part
    
    if (externalOnRemovePart) {
      externalOnRemovePart(partId);
    } else {
      setInternalDesignParts(prev => prev.filter(part => part.id !== partId));
      
      // Switch to first available part
      const remainingParts = designParts.filter(part => part.id !== partId);
      if (remainingParts.length > 0) {
        setInternalActivePart(remainingParts[0].id);
        if (onPartSelect) {
          onPartSelect(remainingParts[0].id);
        }
      }
    }
  };

  const renamePart = (partId: string, newName: string) => {
    if (externalOnRenamePart) {
      externalOnRenamePart(partId, newName);
    } else {
      setInternalDesignParts(prev => prev.map(part => 
        part.id === partId ? { ...part, name: newName } : part
      ));
    }
  };

  const handlePartTypeChange = (partId: string, partType: 'static' | 'personalized') => {
    if (externalOnPartTypeChange) {
      externalOnPartTypeChange(partId, partType);
    } else {
      setInternalDesignParts(prev => prev.map(part => 
        part.id === partId ? { ...part, partType } : part
      ));
    }
  };

  const handlePartSoftwareChange = (partId: string, field: 'cadSoftware' | 'slicer', value: string) => {
    if (externalOnPartSoftwareChange) {
      externalOnPartSoftwareChange(partId, field, value);
    } else {
      setInternalDesignParts(prev => prev.map(part => 
        part.id === partId ? { ...part, [field]: value } : part
      ));
    }
  };

  const handlePartParametersChange = (partId: string, field: string, value: string) => {
    if (!externalDesignParts) {
      setInternalDesignParts(prev => prev.map(part => 
        part.id === partId 
          ? { ...part, parameters: { ...part.parameters, [field]: value } }
          : part
      ));
    }
    
    if (onPartParametersChange && (field === 'sketchName' || field === 'replacementValue')) {
      const part = designParts.find(p => p.id === partId);
      if (part?.parameters) {
        onPartParametersChange(partId, {
          sketchName: field === 'sketchName' ? value : (part.parameters.sketchName || ''),
          replacementValue: field === 'replacementValue' ? value : (part.parameters.replacementValue || '')
        });
      }
    }
  };

  const handlePartChange = (value: string) => {
    if (externalOnPartChange) {
      externalOnPartChange(value);
    } else {
      setInternalActivePart(value);
    }
    
    if (onPartSelect) {
      onPartSelect(value);
    }
  };

  const handleFileTypeChange = (fileId: string, designType: 'static' | 'personalized') => {
    // This would update the file's design type
    console.log(`Changing file ${fileId} to ${designType}`);
  };

  const validatePartFiles = (part: DesignPart) => {
    if (externalValidatePartFiles) {
      return externalValidatePartFiles(part);
    }
    
    const personalizedFiles = part.files.filter(f => f.designType === 'personalized');
    const hasF3D = personalizedFiles.some(f => f.name.toLowerCase().endsWith('.f3d'));
    const hasINI = personalizedFiles.some(f => f.name.toLowerCase().endsWith('.ini'));
    return { hasF3D, hasINI, hasPersonalizedFiles: personalizedFiles.length > 0 };
  };

  const organizedParts = organizeFilesByParts();
  const currentPart = organizedParts.find(part => part.id === activePart) || organizedParts[0];
  const validation = currentPart ? validatePartFiles(currentPart) : { hasF3D: false, hasINI: false, hasPersonalizedFiles: false };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      {/* Part Selection with Controls */}
      <PartSelector
        designParts={designParts}
        activePart={activePart}
        onPartChange={handlePartChange}
        onAddPart={addNewPart}
        onRemovePart={removePart}
        onRenamePart={renamePart}
        onPartTypeChange={handlePartTypeChange}
        onPartSoftwareChange={handlePartSoftwareChange}
        validatePartFiles={validatePartFiles}
      />

      {currentPart && (
        <>
          {/* File Requirements Info for Personalized Files */}
          <ValidationInfo
            partName={currentPart.name}
            hasPersonalizedFiles={validation.hasPersonalizedFiles}
            hasF3D={validation.hasF3D}
            hasINI={validation.hasINI}
          />

          {/* File Upload */}
          <FileUpload
            partName={currentPart.name}
            partId={currentPart.id}
            uploading={uploading}
            onFileUpload={handleFileUpload}
          />

          {/* Parameter Configuration for Personalized Files */}
          <ParameterConfig
            currentPart={currentPart}
            hasPersonalizedFiles={validation.hasPersonalizedFiles}
            onPartParametersChange={handlePartParametersChange}
          />

          {/* Files for current part */}
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
      )}
    </div>
  );
};

export default MultiPartFileManager;
