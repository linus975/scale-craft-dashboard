
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import DesignInformationSection from './design-edit/DesignInformationSection';
import FileManagementSection from './design-edit/FileManagementSection';
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

interface DesignFormData {
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

interface FileManagementData {
  selectedPart: string;
  partType: 'static' | 'customisable';
  cadSoftware: string;
  slicerSoftware: string;
  partColor: string;
  machineType: string;
  sketchName: string;
  replacementType: 'text' | 'dimension';
  nozzleDiameter: string;
  filamentType: string;
}

const AddDesignForm: React.FC<AddDesignFormProps> = ({ onCancel, onSave }) => {
  const { machines } = useMachines();
  const { toast } = useToast();
  const { saveDesignAsProduct } = useDesignToProduct();
  
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [fileManagementData, setFileManagementData] = useState<FileManagementData>({
    selectedPart: 'main',
    partType: 'static',
    cadSoftware: '',
    slicerSoftware: '',
    partColor: '',
    machineType: '',
    sketchName: '',
    replacementType: 'text',
    nozzleDiameter: '',
    filamentType: ''
  });

  const form = useForm<DesignFormData>({
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

  // Handler for when a new part is added - automatically select it
  const handleAddPart = (name: string) => {
    designParts.handleAddPart(name);
    // Get the latest part from designParts after adding
    const latestPart = designParts.designParts[designParts.designParts.length - 1];
    if (latestPart) {
      designParts.handlePartSelect(latestPart.id);
      setFileManagementData(prev => ({ ...prev, selectedPart: latestPart.id }));
    }
  };

  // Handler for when preset values are added - automatically select them
  const handleFileManagementDataChange = (newData: FileManagementData) => {
    setFileManagementData(newData);
  };

  const onSubmit = async (data: DesignFormData) => {
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
        type: part.partType || 'static' as 'static' | 'customisable',
        software: part.cadSoftware,
        specifications: '',
        cadSoftware: part.cadSoftware,
        slicer: part.slicer,
        nozzleDiameter: part.nozzleDiameter,
        filamentType: part.filamentType,
        color: part.color,
        machine: part.machine
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
            control={form.control as any}
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

          {/* File Management Section */}
          <FileManagementSection
            data={fileManagementData}
            onChange={handleFileManagementDataChange}
            designParts={designParts.designParts}
            activePart={designParts.activePart}
            onPartChange={designParts.handlePartSelect}
            onAddPart={handleAddPart}
            onRemovePart={designParts.handleRemovePart}
            onRenamePart={designParts.handleRenamePart}
            onPartTypeChange={designParts.handlePartTypeChange}
          />

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
            <Button type="submit" disabled={saving}>
              {saving ? 'Wird gespeichert...' : 'Produkt speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
