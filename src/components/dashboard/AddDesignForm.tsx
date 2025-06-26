import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import DesignInformationSection from './design-edit/DesignInformationSection';
import UploadProgressDisplay from './design-edit/UploadProgressDisplay';
import { useMachines } from '@/hooks/useMachines';
import { useToast } from '@/hooks/use-toast';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useDesignFileUpload } from '@/hooks/useDesignFileUpload';
import { useDesignParts } from '@/hooks/useDesignParts';
import { useDesignFormValidation } from '@/hooks/useDesignFormValidation';
import { useMultiImageUpload } from '@/hooks/useMultiImageUpload';
import { useDesignToProduct } from '@/hooks/useDesignToProduct';

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
  cadSoftware: string;
  slicer: string;
  nozzleDiameter: string;
  material: string;
}

const AddDesignForm: React.FC<AddDesignFormProps> = ({ onCancel, onSave }) => {
  const { machines } = useMachines();
  const { toast } = useToast();
  const { saveDesignAsProduct } = useDesignToProduct();
  
  // Remove global color and machine state - now part-specific
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
      machine: '',
      cadSoftware: '',
      slicer: '',
      nozzleDiameter: '',
      material: ''
    }
  });

  const trackingType = form.watch('trackingType');

  // Use custom hooks
  const categoryManager = useCategoryManager(form);
  const fileUpload = useDesignFileUpload();
  const designParts = useDesignParts();
  const { validateForm } = useDesignFormValidation(designParts, fileUpload);
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

  const onSubmit = async (data: FormData) => {
    if (saving) return;
    
    console.log('🚀 Starting optimized product save process...', data);
    setSaving(true);
    setProgress(0);
    setCurrentStep('Validating...');
    
    try {
      // Step 1: Basic validation - only name is required
      if (!data.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Design name is required",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      setProgress(20);
      setCurrentStep('Uploading files...');

      // Step 2: Upload files in parallel
      let previewImageFile = null;
      if (fileUpload.previewImage) {
        previewImageFile = fileUpload.previewImage;
      } else if (multiImageUpload.images.length > 0) {
        previewImageFile = multiImageUpload.images[0].file;
      }

      setProgress(60);
      setCurrentStep('Saving product...');

      // Step 3: Save as product with new structure - map design parts to the correct interface
      const mappedDesignParts = designParts.designParts.map(part => ({
        id: part.id,
        name: part.name,
        type: part.partType || 'static' as const,
        software: part.cadSoftware,
        specifications: '',
        cadSoftware: part.cadSoftware,
        slicer: part.slicer,
        nozzleDiameter: part.nozzleDiameter,
        filamentType: part.filamentType
      }));

      await saveDesignAsProduct(
        data,
        mappedDesignParts,
        fileUpload.uploadedFiles,
        previewImageFile || undefined,
        multiImageUpload.images
      );

      setProgress(100);
      setCurrentStep('Complete!');

      // Close the dialog immediately after successful save
      onSave();
      
    } catch (error) {
      console.error('❌ Error creating product:', error);
      toast({
        title: "Fehler beim Erstellen des Produkts",
        description: error instanceof Error ? error.message : "Es gab einen Fehler beim Speichern des Produkts. Bitte versuchen Sie es erneut.",
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
                machines={machines}
                formControl={form.control}
                gcodeFiles={fileUpload.gcodeFiles}
                onGcodeFileChange={fileUpload.handleGcodeFileChange}
                onRemoveGcodeFile={fileUpload.removeGcodeFile}
                getGcodeFileForPart={fileUpload.getGcodeFileForPart}
              />
              
              {/* Upload Progress Display */}
              <UploadProgressDisplay 
                uploadProgress={fileUpload.uploadProgress}
                uploading={fileUpload.uploading}
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
                    Produkt wird gespeichert... Bitte warten Sie.
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
              {saving ? 'Wird gespeichert...' : 'Produkt speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
