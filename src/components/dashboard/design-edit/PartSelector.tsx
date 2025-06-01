
import React, { useState } from 'react';
import PartTypeSelector from './PartTypeSelector';
import PartNameEditor from './PartNameEditor';
import PartControls from './PartControls';
import SoftwareSelectors from './SoftwareSelectors';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
  };
  cadSoftware?: string;
  slicer?: string;
}

interface PartSelectorProps {
  designParts: DesignPart[];
  activePart: string;
  onPartChange: (partId: string) => void;
  onAddPart: (name: string) => void;
  onRemovePart: (partId: string) => void;
  onRenamePart: (partId: string, newName: string) => void;
  onPartTypeChange: (partId: string, partType: 'static' | 'personalized') => void;
  onPartSoftwareChange: (partId: string, field: 'cadSoftware' | 'slicer', value: string) => void;
  validatePartFiles: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
}

const PartSelector: React.FC<PartSelectorProps> = ({
  designParts,
  activePart,
  onPartChange,
  onAddPart,
  onRemovePart,
  onRenamePart,
  onPartTypeChange,
  onPartSoftwareChange,
  validatePartFiles
}) => {
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editPartName, setEditPartName] = useState('');

  const startEditingPart = (partId: string, currentName: string) => {
    setEditingPartId(partId);
    setEditPartName(currentName);
  };

  const savePartName = () => {
    if (editingPartId && editPartName.trim()) {
      onRenamePart(editingPartId, editPartName.trim());
    }
    setEditingPartId(null);
    setEditPartName('');
  };

  const currentPart = designParts.find(part => part.id === activePart) || designParts[0];
  const isEditing = editingPartId === activePart;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 items-end">
        <PartTypeSelector
          partType={currentPart?.partType || 'static'}
          onPartTypeChange={(partType) => onPartTypeChange(activePart, partType)}
          disabled={isEditing}
        />

        <PartNameEditor
          designParts={designParts}
          activePart={activePart}
          isEditing={isEditing}
          editPartName={editPartName}
          onPartChange={onPartChange}
          onEditPartNameChange={setEditPartName}
          onSavePartName={savePartName}
          validatePartFiles={validatePartFiles}
        />
        
        <PartControls
          designParts={designParts}
          activePart={activePart}
          currentPartName={currentPart?.name || ''}
          isEditing={isEditing}
          onStartEditing={() => startEditingPart(activePart, currentPart?.name || '')}
          onSavePartName={savePartName}
          onAddPart={onAddPart}
          onRemovePart={onRemovePart}
        />
      </div>

      {currentPart?.partType === 'personalized' && (
        <SoftwareSelectors
          cadSoftware={currentPart?.cadSoftware}
          slicer={currentPart?.slicer}
          onSoftwareChange={(field, value) => onPartSoftwareChange(activePart, field, value)}
          disabled={isEditing}
        />
      )}
    </div>
  );
};

export default PartSelector;
