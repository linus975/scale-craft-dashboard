
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
    
    // Validate each part - but make files optional
    for (const part of designParts.designParts) {
      const partFiles = fileUpload.uploadedFiles.filter(file => file.partId === part.id);
      
      // Check CAD and Slicer software for personalized parts (only if files are uploaded)
      if (part.partType === 'personalized') {
        const f3dFiles = partFiles.filter(file => file.isF3DFile && file.name.toLowerCase().endsWith('.f3d'));
        const iniFiles = partFiles.filter(file => file.isINIFile && file.name.toLowerCase().endsWith('.ini'));
        
        // Only validate CAD software and slicer if F3D/INI files are present
        if (f3dFiles.length > 0 || iniFiles.length > 0) {
          if (!part.cadSoftware) errors.push(`CAD Software is required for part "${part.name}" when F3D files are uploaded`);
          if (!part.slicer) errors.push(`Slicer Software is required for part "${part.name}" when INI files are uploaded`);
        }
        
        // Validate F3D and INI files only if they exist (no longer required)
        if (f3dFiles.length > 1) errors.push(`Only one F3D file is allowed for part "${part.name}"`);
        if (iniFiles.length > 1) errors.push(`Only one INI file is allowed for part "${part.name}"`);
        
        // Check sketch name and replacement type only if personalized files are uploaded
        if (f3dFiles.length > 0 || iniFiles.length > 0) {
          if (!part.parameters?.sketchName) errors.push(`Sketch Name is required for personalized part "${part.name}" when CAD files are uploaded`);
          if (!part.parameters?.replacementType) errors.push(`Replacement Type is required for personalized part "${part.name}" when CAD files are uploaded`);
        }
      } else {
        // For static parts, G-code files are now optional
        const gcodeFiles = partFiles.filter(file => file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.g'));
        if (gcodeFiles.length > 1) errors.push(`Only one G-code file is allowed for part "${part.name}"`);
      }

      // Nozzle diameter and filament type are now optional
      // Removed validation for these fields
    }
    
    return errors;
  };

  return { validateForm };
};
