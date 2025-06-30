
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
    
    console.log('🚀 [AddDesignForm] Starting structured product save process...');
    console.log('📋 [AddDesignForm] Form data:', data);
    console.log('🔧 [AddDesignForm] Design parts:', designParts.designParts);
    
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

      // Step 2: Get files directly from the hook at submit time
      console.log('📁 [AddDesignForm] Checking selected files at submit time...');
      const currentSelectedFiles = selectedFiles; // Get fresh reference
      console.log('📁 [AddDesignForm] Selected files count:', currentSelectedFiles.length);
      console.log('📁 [AddDesignForm] Selected files details:', currentSelectedFiles.map(f => ({
        name: f.file.name,
        partId: f.partId,
        category: f.fileCategory
      })));

      if (currentSelectedFiles.length === 0) {
        console.log('❌ [AddDesignForm] No files found in selection');
        toast({
          title: "Keine Dateien ausgewählt",
          description: "Bitte wählen Sie mindestens eine Datei aus, bevor Sie das Produkt speichern",
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

      console.log('📦 [AddDesignForm] Saving with structured file paths...');
      console.log('📁 [AddDesignForm] Files to upload:', currentSelectedFiles.length);
      console.log('📁 [AddDesignForm] Files details:', currentSelectedFiles.map(f => `${f.file.name} (${f.fileCategory}) for part ${f.partId}`));

      await saveDesignAsProductWithFiles(
        data,
        mappedDesignParts,
        currentSelectedFiles,
        previewImageFile || undefined,
        multiImageUpload.images
      );

      setProgress(100);
      setCurrentStep('Complete!');

      toast({
        title: "Produkt gespeichert",
        description: "Das Produkt wurde erfolgreich mit allen Dateien gespeichert",
      });

      // Close the dialog immediately after successful save
      onSave();
      
    } catch (error) {
      console.error('❌ [AddDesignForm] Error creating product with structured files:', error);
      toast({
        title: "Fehler beim Speichern",
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
                    Produkt wird mit strukturierten Dateipfaden gespeichert... Bitte warten.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Debug Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>🔍 LIVE DEBUG INFO:</strong></p>
            <p><strong>Aktuelle Dateien in Selection:</strong> {selectedFiles.length}</p>
            <p><strong>Formularbereich bereit:</strong> {data.name ? 'Ja' : 'Nein'}</p>
            <p><strong>Speicher-Status:</strong> {saving ? 'Läuft...' : 'Bereit'}</p>
            {selectedFiles.length > 0 && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p><strong>✅ Dateien bereit zum Upload:</strong></p>
                {selectedFiles.map((file, index) => (
                  <p key={file.id} className="text-green-700">
                    {index + 1}. {file.file.name} (Part: {file.partId}, Typ: {file.fileCategory})
                  </p>
                ))}
              </div>
            )}
            {selectedFiles.length === 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700"><strong>⚠️ Keine Dateien ausgewählt</strong></p>
                <p className="text-red-600 text-xs">Bitte wählen Sie Dateien über das File Management aus</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || selectedFiles.length === 0}>
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
