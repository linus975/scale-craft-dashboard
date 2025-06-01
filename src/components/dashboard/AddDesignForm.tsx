
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File } from 'lucide-react';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import DesignInformationSection from './design-edit/DesignInformationSection';
import { useDesigns } from '@/hooks/useDesigns';
import { useMachines } from '@/hooks/useMachines';
import { usePrintJobs } from '@/hooks/usePrintJobs';
import { useToast } from '@/hooks/use-toast';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useDesignFileUpload } from '@/hooks/useDesignFileUpload';
import { useDesignParts } from '@/hooks/useDesignParts';

interface AddDesignFormProps {
  onCancel: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
  color: string;
  machine: string;
}

const AddDesignForm: React.FC<AddDesignFormProps> = ({ onCancel, onSave }) => {
  const { createDesign } = useDesigns();
  const { machines } = useMachines();
  const { createPrintJob } = usePrintJobs();
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      trackingType: '',
      eanNumber: '',
      description: '',
      category: '',
      color: '',
      machine: ''
    }
  });

  const trackingType = form.watch('trackingType');

  // Use custom hooks
  const categoryManager = useCategoryManager(form);
  const fileUpload = useDesignFileUpload();
  const designParts = useDesignParts();

  // Remove parts from uploaded files when removing a part
  const handleRemovePart = (partId: string) => {
    designParts.handleRemovePart(partId);
    fileUpload.setUploadedFiles(prev => prev.filter(file => file.partId !== partId));
  };

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
        
        const f3dFiles = partFiles.filter(file => file.name.toLowerCase().endsWith('.f3d'));
        const iniFiles = partFiles.filter(file => file.name.toLowerCase().endsWith('.ini'));
        
        if (f3dFiles.length !== 1) errors.push(`Exactly one CAD file (.f3d) is required for part "${part.name}"`);
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

  const createPrintJobsFromDesign = async (designData: any, savedDesign: any) => {
    try {
      const jobs = [];
      
      // Create a separate print job for each part
      for (const part of designParts.designParts) {
        const partFiles = fileUpload.uploadedFiles.filter(file => file.partId === part.id);
        
        const f3dFile = partFiles.find(file => file.name.toLowerCase().endsWith('.f3d'));
        const iniFile = partFiles.find(file => file.name.toLowerCase().endsWith('.ini'));
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
            slicer: part.slicer || null
          },
          priority: 5,
          status: part.partType === 'personalized' ? 'waiting_for_personalization' : 'ready_to_print',
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

  const onSubmit = async (data: FormData) => {
    try {
      // Validate form and files
      const validationErrors = validateForm(data);
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(", "),
          variant: "destructive",
        });
        return;
      }

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

      console.log('Saving design with data:', designData);
      console.log('Design Parts:', designParts.designParts);
      console.log('Uploaded files:', fileUpload.uploadedFiles);

      const savedDesign = await createDesign(designData);
      
      // Create separate print jobs for each part
      const createdJobs = await createPrintJobsFromDesign(designData, savedDesign);
      
      toast({
        title: "Design and Jobs successfully created",
        description: `The design "${data.name}" was saved with ${createdJobs.length} print job(s) created.`,
      });
      
      onSave();
    } catch (error) {
      console.error('Error creating design:', error);
      toast({
        title: "Error creating design",
        description: "There was an error saving the design.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Design Information Section */}
          <DesignInformationSection
            control={form.control}
            trackingType={trackingType}
            categories={categoryManager.categories}
            editingCategory={categoryManager.editingCategory}
            editingCategoryValue={categoryManager.editingCategoryValue}
            showAddCategoryDialog={categoryManager.showAddCategoryDialog}
            newCategoryName={categoryManager.newCategoryName}
            previewImage={fileUpload.previewImage}
            onStartEditCategory={categoryManager.handleStartEditCategory}
            onSaveEditCategory={categoryManager.handleSaveEditCategory}
            onCancelEditCategory={categoryManager.handleCancelEditCategory}
            onAddCategory={categoryManager.handleAddCategory}
            onSaveNewCategory={categoryManager.handleSaveNewCategory}
            onCancelAddCategory={categoryManager.handleCancelAddCategory}
            onDeleteCategory={categoryManager.handleDeleteCategory}
            onPreviewImageDrop={fileUpload.handlePreviewImageDrop}
            onPreviewImageChange={fileUpload.handlePreviewImageChange}
            setEditingCategoryValue={categoryManager.setEditingCategoryValue}
            setNewCategoryName={categoryManager.setNewCategoryName}
            setShowAddCategoryDialog={categoryManager.setShowAddCategoryDialog}
            getValues={form.getValues}
          />

          {/* File Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Manage Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MultiPartFileManager
                uploadedFiles={fileUpload.uploadedFiles}
                loadingFiles={false}
                uploading={fileUpload.uploading}
                onFileUpload={fileUpload.handleFileUpload}
                onFileRemove={fileUpload.handleFileRemove}
                onFileDownload={fileUpload.handleFileDownload}
                onPartParametersChange={designParts.handlePartParametersChange}
                selectedPartId={designParts.selectedPartId}
                onPartSelect={designParts.handlePartSelect}
                designParts={designParts.designParts}
                activePart={designParts.activePart}
                onPartChange={designParts.setActivePart}
                onAddPart={designParts.handleAddPart}
                onRemovePart={handleRemovePart}
                onRenamePart={designParts.handleRenamePart}
                onPartTypeChange={designParts.handlePartTypeChange}
                onPartSoftwareChange={designParts.handlePartSoftwareChange}
                onPartSpecificationChange={designParts.handlePartSpecificationChange}
                validatePartFiles={(part) => designParts.validatePartFiles(part, fileUpload.uploadedFiles)}
                colorValue={form.watch('color')}
                machineValue={form.watch('machine')}
                machines={machines}
                formControl={form.control}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Design
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
