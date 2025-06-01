
import { useDesignParts } from './useDesignParts';
import { useDesignFileUpload } from './useDesignFileUpload';

interface FormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
  color: string;
  machine: string;
}

export const useDesignFormValidation = (
  designParts: ReturnType<typeof useDesignParts>,
  fileUpload: ReturnType<typeof useDesignFileUpload>
) => {
  const validateForm = (data: FormData) => {
    const errors: string[] = [];
    
    // Check required fields
    if (!data.name) errors.push("Design name is required");
    if (!data.trackingType) errors.push("Tracking type is required");
    if (!data.eanNumber) errors.push("EAN/SKU number is required");
    if (!data.color) errors.push("Color is required");
    if (!data.machine) errors.push("Machine is required");
    
    // Validate each part
    for (const part of designParts.designParts) {
      const partFiles = fileUpload.uploadedFiles.filter(file => file.partId === part.id);
      
      // Check CAD and Slicer software for personalized parts
      if (part.partType === 'personalized') {
        if (!part.cadSoftware) errors.push(`CAD Software is required for part "${part.name}"`);
        if (!part.slicer) errors.push(`Slicer Software is required for part "${part.name}"`);
        
        // Validate F3D and INI files separately
        const f3dFiles = partFiles.filter(file => file.isF3DFile && file.name.toLowerCase().endsWith('.f3d'));
        const iniFiles = partFiles.filter(file => file.isINIFile && file.name.toLowerCase().endsWith('.ini'));
        
        if (f3dFiles.length !== 1) errors.push(`Exactly one F3D file is required for part "${part.name}"`);
        if (iniFiles.length !== 1) errors.push(`Exactly one INI file is required for part "${part.name}"`);
        
        // Check sketch name and replacement type for personalized parts
        if (!part.parameters?.sketchName) errors.push(`Sketch Name is required for personalized part "${part.name}"`);
        if (!part.parameters?.replacementType) errors.push(`Replacement Type is required for personalized part "${part.name}"`);
      } else {
        const gcodeFiles = partFiles.filter(file => file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.g'));
        if (gcodeFiles.length !== 1) errors.push(`Exactly one G-code file is required for part "${part.name}"`);
      }

      // Check nozzle diameter and filament type for all parts
      if (!part.nozzleDiameter) errors.push(`Nozzle Diameter is required for part "${part.name}"`);
      if (!part.filamentType) errors.push(`Filament Type is required for part "${part.name}"`);
    }
    
    return errors;
  };

  return { validateForm };
};
