import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File } from 'lucide-react';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import DesignInformationSection from './design-edit/DesignInformationSection';
import { useDesigns } from '@/hooks/useDesigns';
import { useMachines } from '@/hooks/useMachines';
import { useToast } from '@/hooks/use-toast';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useDesignFileUpload } from '@/hooks/useDesignFileUpload';
import { useDesignParts } from '@/hooks/useDesignParts';
import { useDesignFormValidation } from '@/hooks/useDesignFormValidation';
import { useDesignJobCreation } from '@/hooks/useDesignJobCreation';
import { useDesignDataCreation } from '@/hooks/useDesignDataCreation';
import { useMultiImageUpload } from '@/hooks/useMultiImageUpload';
import { useFileUpload } from '@/hooks/useFileUpload';

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
  const { toast } = useToast();
  const { uploadFile } = useFileUpload();
  
  // State for color and machine
  const [colorValue, setColorValue] = useState('');
  const [machineValue, setMachineValue] = useState('');
  const [saving, setSaving] = useState(false);

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
  const { validateForm } = useDesignFormValidation(designParts, fileUpload);
  const { createPrintJobsFromDesign } = useDesignJobCreation(designParts, fileUpload);
  const { createDesignData } = useDesignDataCreation(designParts, fileUpload);
  const multiImageUpload = useMultiImageUpload();

  // Clean up image previews on unmount
  useEffect(() => {
    return () => {
      multiImageUpload.cleanupPreviews();
    };
  }, []);

  // Remove parts from uploaded files when removing a part
  const handleRemovePart = (partId: string) => {
    designParts.handleRemovePart(partId);
    fileUpload.setUploadedFiles(prev => prev.filter(file => file.partId !== partId));
  };

  const handleColorChange = (value: string) => {
    setColorValue(value);
    form.setValue('color', value);
  };

  const handleMachineChange = (value: string) => {
    setMachineValue(value);
    form.setValue('machine', value);
  };

  const onSubmit = async (data: FormData) => {
    if (saving) return; // Prevent double submission
    
    try {
      setSaving(true);
      
      // Basic validation
      const basicValidationErrors: string[] = [];
      if (!data.name) basicValidationErrors.push("Design name is required");
      if (!data.trackingType) basicValidationErrors.push("Tracking type is required");
      if (!data.eanNumber) basicValidationErrors.push("EAN/SKU number is required");
      
      if (basicValidationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: basicValidationErrors.join(", "),
          variant: "destructive",
        });
        return;
      }

      console.log('Starting design save process...');

      // Upload preview image if exists
      let previewImagePath = null;
      if (fileUpload.previewImage) {
        console.log('Uploading preview image...');
        previewImagePath = await fileUpload.uploadPreviewImage();
        console.log('Preview image uploaded:', previewImagePath);
      }

      // Upload multi-images if exists
      if (multiImageUpload.images.length > 0) {
        console.log('Uploading multi-images...');
        // Upload first image as preview if no preview image was set
        if (!previewImagePath && multiImageUpload.images[0]) {
          const firstImageFile = multiImageUpload.images[0].file;
          try {
            previewImagePath = await uploadFile(firstImageFile, 'preview-images');
            console.log('First multi-image uploaded as preview:', previewImagePath);
          } catch (error) {
            console.error('Error uploading first multi-image as preview:', error);
          }
        }
      }

      // Upload G-Code file and get content for the main part
      let gcodeFilePath = null;
      let gcodeContent = null;
      
      const mainPartGcodeFile = fileUpload.getGcodeFileForPart(designParts.activePart);
      if (mainPartGcodeFile) {
        console.log('Uploading G-Code file...');
        const gcodeResult = await fileUpload.uploadGcodeFile(designParts.activePart);
        gcodeFilePath = gcodeResult.path;
        gcodeContent = gcodeResult.content;
        console.log('G-Code uploaded:', gcodeFilePath);
        
        // Show success toast for G-Code upload
        toast({
          title: "G-Code-Datei hochgeladen",
          description: `Die G-Code-Datei "${mainPartGcodeFile.name}" wurde erfolgreich hochgeladen.`,
        });
      }

      // Include color and machine in the data
      const designDataWithColorMachine = {
        ...data,
        color: colorValue,
        machine: machineValue
      };

      // Create design data
      let designData = createDesignData(designDataWithColorMachine);
      
      // Override with uploaded file paths and content
      designData = {
        ...designData,
        preview_image_path: previewImagePath,
        gcode_file_path: gcodeFilePath,
        gcode: gcodeContent
      };

      console.log('Saving design with data:', designData);

      const savedDesign = await createDesign(designData);
      
      // Only create print jobs if files are present
      if (fileUpload.uploadedFiles.length > 0 || Object.keys(fileUpload.gcodeFiles).length > 0) {
        const createdJobs = await createPrintJobsFromDesign(designDataWithColorMachine, savedDesign);
        
        toast({
          title: "Design and Jobs successfully created",
          description: `The design "${data.name}" was saved with ${createdJobs.length} print job(s) created.`,
        });
      } else {
        toast({
          title: "Design successfully created",
          description: `The design "${data.name}" was saved.`,
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Error creating design:', error);
      toast({
        title: "Error creating design",
        description: "There was an error saving the design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
            images={multiImageUpload.images}
            onStartEditCategory={categoryManager.handleStartEditCategory}
            onSaveEditCategory={categoryManager.handleSaveEditCategory}
            onCancelEditCategory={categoryManager.handleCancelEditCategory}
            onAddCategory={categoryManager.handleAddCategory}
            onSaveNewCategory={categoryManager.handleSaveNewCategory}
            onCancelAddCategory={categoryManager.handleCancelAddCategory}
            onDeleteCategory={categoryManager.handleDeleteCategory}
            onImageDrop={multiImageUpload.handleImageDrop}
            onImageUpload={multiImageUpload.handleImageUpload}
            onImagesChange={multiImageUpload.handleImagesChange}
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
                Dateien verwalten (optional)
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
                colorValue={colorValue}
                machineValue={machineValue}
                machines={machines}
                formControl={form.control}
                onColorChange={handleColorChange}
                onMachineChange={handleMachineChange}
                gcodeFiles={fileUpload.gcodeFiles}
                onGcodeFileChange={fileUpload.handleGcodeFileChange}
                onRemoveGcodeFile={fileUpload.removeGcodeFile}
                getGcodeFileForPart={fileUpload.getGcodeFileForPart}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || fileUpload.uploading}>
              {saving ? 'Wird gespeichert...' : 'Design speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
