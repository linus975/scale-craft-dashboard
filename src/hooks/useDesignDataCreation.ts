
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

export const useDesignDataCreation = (
  designParts: ReturnType<typeof useDesignParts>,
  fileUpload: ReturnType<typeof useDesignFileUpload>
) => {
  const createDesignData = (data: FormData) => {
    // Create design data structure for multi-part support
    const mainPart = designParts.designParts[0];
    const mainPartFiles = fileUpload.uploadedFiles.filter(file => file.partId === mainPart.id);
    
    const f3dFile = mainPartFiles.find(file => file.name.toLowerCase().endsWith('.f3d'));
    const iniFile = mainPartFiles.find(file => file.name.toLowerCase().endsWith('.ini'));
    const gcodeFile = mainPartFiles.find(file => file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.g'));

    const designData = {
      name: data.name,
      tracking_type: data.trackingType,
      ean_number: data.eanNumber,
      description: data.description,
      category: data.category,
      color: data.color,
      machine: data.machine,
      design_type: mainPart?.partType || 'static',
      cad_file_path: f3dFile?.path || null,
      ini_file_path: iniFile?.path || null,
      gcode_file_path: gcodeFile?.path || null,
      preview_image_path: fileUpload.previewImage ? `preview/${fileUpload.previewImage.name}` : null,
      cad_software: mainPart?.cadSoftware || null,
      slicer: mainPart?.slicer || null,
      sketch_name: mainPart?.parameters?.sketchName || null,
      replacement_value: mainPart?.parameters?.replacementValue || null,
      nozzle_diameter: mainPart?.nozzleDiameter || null,
      material: mainPart?.filamentType || null,
      version: 'v1.0',
      // Store all parts data as JSON
      parameters: {
        parts: designParts.designParts.map(part => ({
          id: part.id,
          name: part.name,
          partType: part.partType,
          cadSoftware: part.cadSoftware,
          slicer: part.slicer,
          nozzleDiameter: part.nozzleDiameter,
          filamentType: part.filamentType,
          parameters: part.parameters,
          files: fileUpload.uploadedFiles.filter(file => file.partId === part.id).map(file => ({
            name: file.name,
            path: file.path,
            type: file.type
          }))
        }))
      }
    };

    return designData;
  };

  return { createDesignData };
};
