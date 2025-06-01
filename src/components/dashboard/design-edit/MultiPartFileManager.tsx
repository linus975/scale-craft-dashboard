
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
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
  };
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
}) => {
  const [designParts, setDesignParts] = useState<DesignPart[]>([
    { id: 'part1', name: 'Teil 1', files: [], parameters: { sketchName: '', replacementValue: '' } }
  ]);
  const [activePart, setActivePart] = useState(selectedPartId || 'part1');

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
    const newPart: DesignPart = {
      id: `part-${Date.now()}`,
      name: name,
      files: [],
      parameters: { sketchName: '', replacementValue: '' }
    };
    setDesignParts(prev => [...prev, newPart]);
    setActivePart(newPart.id);
    
    if (onPartSelect) {
      onPartSelect(newPart.id);
    }
  };

  const removePart = (partId: string) => {
    if (designParts.length <= 1) return; // Keep at least one part
    
    setDesignParts(prev => prev.filter(part => part.id !== partId));
    
    // Switch to first available part
    const remainingParts = designParts.filter(part => part.id !== partId);
    if (remainingParts.length > 0) {
      setActivePart(remainingParts[0].id);
      if (onPartSelect) {
        onPartSelect(remainingParts[0].id);
      }
    }
  };

  const renamePart = (partId: string, newName: string) => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId ? { ...part, name: newName } : part
    ));
  };

  const handlePartParametersChange = (partId: string, field: string, value: string) => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId 
        ? { ...part, parameters: { ...part.parameters, [field]: value } }
        : part
    ));
    
    if (onPartParametersChange) {
      const part = designParts.find(p => p.id === partId);
      if (part?.parameters) {
        onPartParametersChange(partId, {
          sketchName: part.parameters.sketchName || '',
          replacementValue: part.parameters.replacementValue || ''
        });
      }
    }
  };

  const handlePartChange = (value: string) => {
    setActivePart(value);
    if (onPartSelect) {
      onPartSelect(value);
    }
  };

  const handleFileTypeChange = (fileId: string, designType: 'static' | 'personalized') => {
    // This would update the file's design type
    console.log(`Changing file ${fileId} to ${designType}`);
  };

  const validatePartFiles = (part: DesignPart) => {
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

          {/* Parameter Configuration for Personalized Files */}
          <ParameterConfig
            currentPart={currentPart}
            hasPersonalizedFiles={validation.hasPersonalizedFiles}
            onPartParametersChange={handlePartParametersChange}
          />

          {/* File Upload */}
          <FileUpload
            partName={currentPart.name}
            partId={currentPart.id}
            uploading={uploading}
            onFileUpload={handleFileUpload}
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
