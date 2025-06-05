
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
    const gcodeFile = mainPartFiles?.find((file: any) => file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.g'));

    // Get G-Code file for the active part - prioritize file upload over raw text
    const activePartGcodeFile = fileUpload.getGcodeFileForPart ? fileUpload.getGcodeFileForPart(designParts.activePart) : null;
    
    // Get G-Code content - either from uploaded file or from existing gcode file
    let gcodeContent = null;
    let gcodeFilePath = null;
    
    if (activePartGcodeFile) {
      // If there's an uploaded G-Code file for the active part, use it
      gcodeFilePath = `gcode/${activePartGcodeFile.name}`;
    } else if (gcodeFile) {
      // Fallback to uploaded G-Code file in the main part files
      gcodeFilePath = gcodeFile.path;
    }

    const designData = {
      name: data.name,
      tracking_type: data.trackingType,
      ean_number: data.eanNumber,
      description: data.description || null,
      category: data.category,
      design_type: mainPart?.partType || 'static',
      // Store F3D and INI files separately in database
      cad_file_path: f3dFile?.path || null,
      ini_file_path: iniFile?.path || null,
      gcode_file_path: gcodeFilePath,
      gcode: gcodeContent, // Store actual G-Code content if available
      preview_image_path: fileUpload.previewImage ? `preview/${fileUpload.previewImage.name}` : null,
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
