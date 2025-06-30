
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import DesignInformationSection from './design-edit/DesignInformationSection';
import FileManagementSection from './design-edit/FileManagementSection';
import { useMachines } from '@/hooks/useMachines';
import { useToast } from '@/hooks/use-toast';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useDesignParts } from '@/hooks/useDesignParts';
import { useMultiImageUpload } from '@/hooks/useMultiImageUpload';
import { useFileSelection } from '@/hooks/useFileSelection';
import { useEnhancedDesignToProduct } from '@/hooks/useEnhancedDesignToProduct';

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
  partType: 'static' | 'personalizable';
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
  const { saveDesignAsProductWithFiles } = useEnhancedDesignToProduct();
  const { selectedFiles, getAllFiles } = useFileSelection();
  
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
  const designParts = useDesignParts();
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
  };

  // Handler for when preset values are added - automatically select them
  const handleFileManagementDataChange = (newData: FileManagementData) => {
    setFileManagementData(newData);
    
    // Update the design parts with the current part's data
    const currentPart = designParts.designParts.find(part => part.id === designParts.activePart);
    if (currentPart) {
      designParts.setDesignParts(prev => prev.map(part => 
        part.id === designParts.activePart 
          ? { 
              ...part, 
              partType: newData.partType,
              cadSoftware: newData.cadSoftware,
              slicer: newData.slicerSoftware,
              color: newData.partColor,
              machine: newData.machineType,
              nozzleDiameter: newData.nozzleDiameter,
              filamentType: newData.filamentType,
              parameters: {
                ...part.parameters,
                sketchName: newData.sketchName,
                replacementType: newData.replacementType
              }
            }
          : part
      ));
    }
  };

  const onSubmit = async (data: DesignFormData) => {
    if (saving) return;
    
    console.log('🚀 Starting structured product save process...');
    console.log('📋 Form data:', data);
    console.log('🔧 Design parts:', designParts.designParts);
    console.log('📁 Selected files:', selectedFiles);
    console.log('📁 Total files:', selectedFiles.length);
    
    // Debug: Log each file
    selectedFiles.forEach((file, index) => {
      console.log(`📄 File ${index + 1}:`, {
        name: file.file.name,
        size: file.file.size,
        type: file.file.type,
        partId: file.partId,
        category: file.fileCategory
      });
    });
    
    setSaving(true);
    setProgress(0);
    setCurrentStep('Validating...');
    
    try {
      // Step 1: Basic validation
      if (!data.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Design name is required",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Step 2: Check if we have files to upload
      if (selectedFiles.length === 0) {
        toast({
          title: "No Files Selected",
          description: "Please select at least one file before saving the product",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      setProgress(20);
      setCurrentStep('Uploading files and saving product...');

      // Step 3: Save product with structured file upload
      const mappedDesignParts = designParts.designParts.map(part => ({
        id: part.id,
        name: part.name,
        type: part.partType || 'static' as 'static' | 'personalizable',
        software: part.cadSoftware,
        specifications: '',
        cadSoftware: part.cadSoftware,
        slicer: part.slicer,
        nozzleDiameter: part.nozzleDiameter,
        filamentType: part.filamentType,
        color: part.color,
        machine: part.machine
      }));

      setProgress(60);

      // Prepare preview image
      let previewImageFile = null;
      if (multiImageUpload.images.length > 0) {
        previewImageFile = multiImageUpload.images[0].file;
      }

      console.log('📦 Saving with structured file paths...');
      console.log('📁 Files to upload:', selectedFiles.length);

      await saveDesignAsProductWithFiles(
        data,
        mappedDesignParts,
        selectedFiles,
        previewImageFile || undefined,
        multiImageUpload.images
      );

      setProgress(100);
      setCurrentStep('Complete!');

      // Close the dialog immediately after successful save
      onSave();
      
    } catch (error) {
      console.error('❌ Error creating product with structured files:', error);
      toast({
        title: "Error Creating Product",
        description: error instanceof Error ? error.message : "There was an error saving the product. Please try again.",
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

          {/* File Management Section with structured file handling */}
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
                    Product is being saved with structured file paths... Please wait.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
