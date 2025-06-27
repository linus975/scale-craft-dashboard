
import { useState } from 'react';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'customisable';
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

export const useDesignParts = () => {
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [designParts, setDesignParts] = useState<DesignPart[]>([
    { 
      id: 'main', 
      name: 'Main Part', 
      files: [], 
      partType: 'static',
      cadSoftware: '',
      slicer: '',
      nozzleDiameter: '',
      filamentType: '',
      color: '',
      machine: ''
    }
  ]);
  const [activePart, setActivePart] = useState<string>('main');

  const handlePartParametersChange = (partId: string, parameters: { sketchName: string; replacementValue: string }) => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId 
        ? { 
            ...part, 
            parameters: { 
              ...part.parameters, 
              sketchName: parameters.sketchName,
              replacementValue: parameters.replacementValue
            } 
          }
        : part
    ));
  };

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
    setActivePart(partId);
  };

  const handleAddPart = (name: string) => {
    const newPart: DesignPart = {
      id: Date.now().toString(),
      name,
      files: [],
      partType: 'static',
      cadSoftware: '',
      slicer: '',
      nozzleDiameter: '',
      filamentType: '',
      color: '',
      machine: ''
    };
    setDesignParts(prev => [...prev, newPart]);
    setActivePart(newPart.id);
    setSelectedPartId(newPart.id);
  };

  const handleRemovePart = (partId: string) => {
    if (designParts.length <= 1) return;
    
    setDesignParts(prev => prev.filter(part => part.id !== partId));
    
    if (activePart === partId) {
      const remainingParts = designParts.filter(part => part.id !== partId);
      if (remainingParts.length > 0) {
        setActivePart(remainingParts[0].id);
        setSelectedPartId(remainingParts[0].id);
      }
    }
  };

  const handleRenamePart = (partId: string, newName: string) => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, name: newName } : part
    ));
  };

  const handlePartTypeChange = (partId: string, partType: 'static' | 'customisable') => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, partType } : part
    ));
  };

  const handlePartSoftwareChange = (partId: string, field: 'cadSoftware' | 'slicer', value: string) => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, [field]: value } : part
    ));
  };

  const handlePartSpecificationChange = (partId: string, field: 'nozzleDiameter' | 'filamentType' | 'color' | 'machine', value: string) => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, [field]: value } : part
    ));
  };

  const validatePartFiles = (part: DesignPart, uploadedFiles: any[]) => {
    const partFiles = uploadedFiles.filter(file => file.partId === part.id);
    const hasF3D = partFiles.some(file => file.name.toLowerCase().endsWith('.f3d'));
    const hasINI = partFiles.some(file => file.name.toLowerCase().endsWith('.ini'));
    const hasPersonalizedFiles = partFiles.some(file => 
      file.name.toLowerCase().endsWith('.f3d') || file.name.toLowerCase().endsWith('.ini')
    );
    
    return { hasF3D, hasINI, hasPersonalizedFiles };
  };

  return {
    selectedPartId,
    designParts,
    activePart,
    setActivePart,
    handlePartParametersChange,
    handlePartSelect,
    handleAddPart,
    handleRemovePart,
    handleRenamePart,
    handlePartTypeChange,
    handlePartSoftwareChange,
    handlePartSpecificationChange,
    validatePartFiles
  };
};
