import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import DesignInformationSection from './design-edit/DesignInformationSection';
import { useDesigns } from '@/hooks/useDesigns';
import { useMachines } from '@/hooks/useMachines';
import { useToast } from '@/hooks/use-toast';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useDesignFileUpload } from '@/hooks/useDesignFileUpload';
import { useDesignParts } from '@/hooks/useDesignParts';
import { useDesignFormValidation } from '@/hooks/useDesignFormValidation';
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
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

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
    
    console.log('🚀 Starting optimized design save process...', data);
    setSaving(true);
    setProgress(0);
    setCurrentStep('Validating...');
    
    try {
      // Step 1: Basic validation - only name is required
      const basicValidationErrors: string[] = [];
      if (!data.name.trim()) {
        basicValidationErrors.push("Design name is required");
      }
      
      if (basicValidationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: basicValidationErrors.join(", "),
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      setProgress(20);
      setCurrentStep('Uploading preview image...');

      // Step 2: Upload preview image if exists
      let previewImagePath = null;
      if (fileUpload.previewImage) {
        previewImagePath = await fileUpload.uploadPreviewImage();
        setProgress(40);
      }

      // Step 3: Upload multi-images if exists
      if (multiImageUpload.images.length > 0) {
        setCurrentStep('Uploading images...');
        // Upload first image as preview if no preview image was set
        if (!previewImagePath && multiImageUpload.images[0]) {
          const firstImageFile = multiImageUpload.images[0].file;
          try {
            previewImagePath = await uploadFile(firstImageFile, 'previews');
          } catch (error) {
            console.error('❌ Error uploading first multi-image as preview:', error);
          }
        }
        setProgress(60);
      }

      // Step 4: Upload G-Code file (optimized)
      let gcodeFilePath = null;
      let gcodeFileName = null;
      
      const mainPartGcodeFile = fileUpload.getGcodeFileForPart(designParts.activePart);
      if (mainPartGcodeFile) {
        setCurrentStep('Uploading G-Code file...');
        const gcodeResult = await fileUpload.uploadGcodeFile(designParts.activePart);
        gcodeFilePath = gcodeResult.path;
        gcodeFileName = mainPartGcodeFile.name;
        setProgress(80);
      }

      // Step 5: Prepare design data
      setCurrentStep('Preparing design data...');
      const designDataWithColorMachine = {
        ...data,
        color: colorValue,
        machine: machineValue
      };

      let designData = createDesignData(designDataWithColorMachine);
      
      // Override with uploaded file paths
      designData = {
        ...designData,
        preview_image_path: previewImagePath,
        gcode_file_path: gcodeFilePath,
        gcode: null, // Don't store content anymore
        category: data.category.trim() || 'Allgemein'
      };

      setProgress(90);
      setCurrentStep('Saving to database...');

      // Step 6: Save design to database (no print job creation)
      const savedDesign = await createDesign(designData);
      setProgress(100);
      setCurrentStep('Complete!');

      // Show success message
      let successMessage = `Das Design "${data.name}" wurde erfolgreich gespeichert.`;
      if (gcodeFileName) {
        successMessage += ` G-Code-Datei "${gcodeFileName}" wurde hochgeladen.`;
      }
      
      toast({
        title: "Design erfolgreich erstellt",
        description: successMessage,
      });
      
      // Close the dialog immediately after successful save
      onSave();
      
    } catch (error) {
      console.error('❌ Error creating design:', error);
      toast({
        title: "Fehler beim Erstellen des Designs",
        description: error instanceof Error ? error.message : "Es gab einen Fehler beim Speichern des Designs. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setProgress(0);
      setCurrentStep('');
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

          {/* Progress Indicator when saving */}
          {saving && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">{currentStep}</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Design wird gespeichert... Bitte warten Sie.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
