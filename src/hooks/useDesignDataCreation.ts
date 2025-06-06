
interface FormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
  color?: string;
  machine?: string;
}

export const useDesignDataCreation = (
  designParts: any,
  fileUpload: any
) => {
  const createDesignData = (data: FormData) => {
    // Create design data structure for multi-part support
    const mainPart = designParts.designParts[0];
    const mainPartFiles = fileUpload.uploadedFiles.filter((file: any) => file.partId === mainPart?.id);
    
    // Separate F3D and INI files for individual database storage
    const f3dFile = mainPartFiles?.find((file: any) => file.isF3DFile && file.name.toLowerCase().endsWith('.f3d'));
    const iniFile = mainPartFiles?.find((file: any) => file.isINIFile && file.name.toLowerCase().endsWith('.ini'));

    const designData = {
      name: data.name,
      tracking_type: data.trackingType,
      ean_number: data.eanNumber,
      description: data.description || null,
      category: data.category.trim() || 'Allgemein', // Always provide default
      design_type: mainPart?.partType || 'static',
      // Store F3D and INI files separately in database
      cad_file_path: f3dFile?.path || null,
      ini_file_path: iniFile?.path || null,
      gcode_file_path: null, // Will be set separately during upload
      gcode: null, // Don't store content anymore - only file path
      preview_image_path: null, // Will be set separately during upload
      cad_software: mainPart?.cadSoftware || null,
      slicer: mainPart?.slicer || null,
      sketch_name: mainPart?.parameters?.sketchName || null,
      replacement_value: mainPart?.parameters?.replacementValue || null,
      nozzle_diameter: mainPart?.nozzleDiameter || null,
      material: mainPart?.filamentType || null,
      color: data.color || null,
      machine: data.machine || null,
      version: 'v1.0'
    };

    return designData;
  };

  return { createDesignData };
};
