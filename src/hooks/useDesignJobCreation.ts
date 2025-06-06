
import { usePrintJobs } from './usePrintJobs';
import { useDesignParts } from './useDesignParts';
import { useDesignFileUpload } from './useDesignFileUpload';

export const useDesignJobCreation = (
  designParts: ReturnType<typeof useDesignParts>,
  fileUpload: ReturnType<typeof useDesignFileUpload>
) => {
  const { createPrintJob } = usePrintJobs();

  const createPrintJobsFromDesign = async (designData: any, savedDesign: any) => {
    try {
      const jobs = [];
      
      // Create a separate print job for each part
      for (const part of designParts.designParts) {
        const partFiles = fileUpload.uploadedFiles.filter(file => file.partId === part.id);
        
        // Get F3D and INI files separately
        const f3dFile = partFiles.find(file => file.isF3DFile && file.name.toLowerCase().endsWith('.f3d'));
        const iniFile = partFiles.find(file => file.isINIFile && file.name.toLowerCase().endsWith('.ini'));
        const gcodeFile = partFiles.find(file => file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.g'));

        const jobData = {
          product_id: savedDesign.id,
          product_name: `${designData.name} - ${part.name}`,
          ean_number: designData.ean_number,
          source_type: 'design' as const,
          quantity: 1,
          material: part.filamentType,
          color: designData.color,
          model_file_path: f3dFile?.path || gcodeFile?.path || null,
          gcode_file_path: gcodeFile?.path || null,
          personalization_data: part.partType === 'personalized' ? {
            partId: part.id,
            partName: part.name,
            sketchName: part.parameters?.sketchName,
            replacementValue: part.parameters?.replacementValue,
            replacementType: part.parameters?.replacementType,
            cadSoftware: part.cadSoftware,
            slicer: part.slicer,
            // Store F3D and INI paths separately for personalization
            cadFilePath: f3dFile?.path,
            iniFilePath: iniFile?.path
          } : null,
          parameters: {
            partId: part.id,
            partName: part.name,
            partType: part.partType,
            nozzleDiameter: part.nozzleDiameter,
            filamentType: part.filamentType,
            cadSoftware: part.cadSoftware || null,
            slicer: part.slicer || null,
            // Include separate file references
            f3dFilePath: f3dFile?.path || null,
            iniFilePath: iniFile?.path || null
          },
          priority: 5,
          status: 'waiting_for_classifying', // Always start with waiting_for_classifying
          notes: `Auto-generated job from design "${designData.name}" for part "${part.name}"`
        };

        const createdJob = await createPrintJob(jobData);
        jobs.push(createdJob);
      }

      return jobs;
    } catch (error) {
      console.error('Error creating print jobs from design:', error);
      throw error;
    }
  };

  return { createPrintJobsFromDesign };
};
