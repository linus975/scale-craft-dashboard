
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
  
  // State for color and machine
  const [colorValue, setColorValue] = useState('');
  const [machineValue, setMachineValue] = useState('');

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

  // Helper function to read file content as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Make files optional in validation - only validate basic required fields
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

      // Include color and machine in the data
      const designDataWithColorMachine = {
        ...data,
        color: colorValue,
        machine: machineValue
      };

      let designData = createDesignData(designDataWithColorMachine);

      // Read G-Code file content for the main part if available
      const mainPartGcodeFile = fileUpload.getGcodeFileForPart(designParts.activePart);
      if (mainPartGcodeFile) {
        try {
          const gcodeContent = await readFileAsText(mainPartGcodeFile);
          designData = {
            ...designData,
            gcode: gcodeContent
          };
        } catch (error) {
          console.error('Error reading G-Code file:', error);
          toast({
            title: "Error reading G-Code file",
            description: "Could not read the G-Code file content.",
            variant: "destructive",
          });
          return;
        }
      }

      // Add image data if any images are uploaded
      if (multiImageUpload.images.length > 0) {
        // For now, we'll just take the first image as preview_image_path
        // In a real implementation, you'd upload all images to storage
        const firstImage = multiImageUpload.images[0];
        designData = {
          ...designData,
          preview_image_path: firstImage.file.name // This would be the actual uploaded path in production
        };
      }

      console.log('Saving design with data:', designData);
      console.log('Design Parts:', designParts.designParts);
      console.log('Uploaded files:', fileUpload.uploadedFiles);
      console.log('G-Code files:', fileUpload.gcodeFiles);
      console.log('Images:', multiImageUpload.images);
      console.log('Color:', colorValue, 'Machine:', machineValue);

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
          description: `The design "${data.name}" was saved. You can add files later.`,
        });
      }
      
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button type="submit">
              Design speichern
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
