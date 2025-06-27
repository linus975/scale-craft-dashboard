
import { useState } from 'react';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
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

interface UseMultiPartManagerProps {
  externalDesignParts?: DesignPart[];
  externalActivePart?: string;
  selectedPartId?: string;
  onPartSelect?: (partId: string) => void;
}

export const useMultiPartManager = ({
  externalDesignParts,
  externalActivePart,
  selectedPartId,
  onPartSelect
}: UseMultiPartManagerProps) => {
  const [internalDesignParts, setInternalDesignParts] = useState<DesignPart[]>([
    { 
      id: 'part1', 
      name: 'Teil 1', 
      files: [], 
      partType: 'static', 
      parameters: { sketchName: '', replacementValue: '', replacementType: 'text' },
      cadSoftware: '',
      slicer: '',
      nozzleDiameter: '',
      filamentType: '',
      color: '',
      machine: ''
    }
  ]);
  const [internalActivePart, setInternalActivePart] = useState(selectedPartId || 'part1');

  const designParts = externalDesignParts || internalDesignParts;
  const activePart = externalActivePart || internalActivePart;

  const addNewPart = (name: string, externalOnAddPart?: (name: string) => void) => {
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
        slicer: '',
        nozzleDiameter: '',
        filamentType: '',
        color: '',
        machine: ''
      };
      setInternalDesignParts(prev => [...prev, newPart]);
      setInternalActivePart(newPart.id);
      
      if (onPartSelect) {
        onPartSelect(newPart.id);
      }
    }
  };

  const removePart = (partId: string, externalOnRemovePart?: (partId: string) => void) => {
    if (designParts.length <= 1) return;
    
    if (externalOnRemovePart) {
      externalOnRemovePart(partId);
    } else {
      setInternalDesignParts(prev => prev.filter(part => part.id !== partId));
      
      const remainingParts = designParts.filter(part => part.id !== partId);
      if (remainingParts.length > 0) {
        setInternalActivePart(remainingParts[0].id);
        if (onPartSelect) {
          onPartSelect(remainingParts[0].id);
        }
      }
    }
  };

  const renamePart = (partId: string, newName: string, externalOnRenamePart?: (partId: string, newName: string) => void) => {
    if (externalOnRenamePart) {
      externalOnRenamePart(partId, newName);
    } else {
      setInternalDesignParts(prev => prev.map(part => 
        part.id === partId ? { ...part, name: newName } : part
      ));
    }
  };

  const handlePartTypeChange = (partId: string, partType: 'static' | 'personalizable', externalOnPartTypeChange?: (partId: string, partType: 'static' | 'personalizable') => void) => {
    if (externalOnPartTypeChange) {
      externalOnPartTypeChange(partId, partType);
    } else {
      setInternalDesignParts(prev => prev.map(part => 
        part.id === partId ? { ...part, partType } : part
      ));
    }
  };

  const handlePartSoftwareChange = (partId: string, field: 'cadSoftware' | 'slicer', value: string, externalOnPartSoftwareChange?: (partId: string, field: 'cadSoftware' | 'slicer', value: string) => void) => {
    if (externalOnPartSoftwareChange) {
      externalOnPartSoftwareChange(partId, field, value);
    } else {
      setInternalDesignParts(prev => prev.map(part => 
        part.id === partId ? { ...part, [field]: value } : part
      ));
    }
  };

  const handlePartParametersChange = (partId: string, field: string, value: string, onPartParametersChange?: (partId: string, parameters: { sketchName: string; replacementValue: string }) => void) => {
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

  const handlePartChange = (value: string, externalOnPartChange?: (partId: string) => void) => {
    if (externalOnPartChange) {
      externalOnPartChange(value);
    } else {
      setInternalActivePart(value);
    }
    
    if (onPartSelect) {
      onPartSelect(value);
    }
  };

  return {
    designParts,
    activePart,
    addNewPart,
    removePart,
    renamePart,
    handlePartTypeChange,
    handlePartSoftwareChange,
    handlePartParametersChange,
    handlePartChange
  };
};
