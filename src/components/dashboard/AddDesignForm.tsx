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
    
    console.log('🚀 [AddDesignForm] Starting product save process...');
    console.log('📋 [AddDesignForm] Form data:', data);
    console.log('🔧 [AddDesignForm] Design parts:', designParts.designParts);
    console.log('📁 [AddDesignForm] Selected files at submit:', selectedFiles);
    
    setSaving(true);
    setProgress(10);
    setCurrentStep('Validierung läuft...');
    
    try {
      // Step 1: Validate form data
      if (!data.name.trim()) {
        throw new Error('Produktname ist erforderlich');
      }

      if (!data.eanNumber.trim()) {
        throw new Error('EAN-Nummer ist erforderlich');
      }

      setProgress(20);
      setCurrentStep('Dateien werden überprüft...');

      // Step 2: Validate file selection
      if (selectedFiles.length === 0) {
        throw new Error('Bitte wählen Sie mindestens eine Datei aus');
      }

      // Check if all parts have at least one file
      const partsWithoutFiles = designParts.designParts.filter(part => 
        !selectedFiles.some(file => file.partId === part.id)
      );

      if (partsWithoutFiles.length > 0) {
        throw new Error(`Folgende Parts haben keine Dateien: ${partsWithoutFiles.map(p => p.name).join(', ')}`);
      }

      setProgress(40);
      setCurrentStep('Produkt wird erstellt...');

      // Step 3: Prepare parts data
      const mappedDesignParts = designParts.designParts.map(part => ({
        id: part.id,
        name: part.name,
        type: part.partType || 'static' as 'static' | 'personalizable',
        software: part.cadSoftware || '',
        specifications: '',
        cadSoftware: part.cadSoftware,
        slicer: part.slicer,
        nozzleDiameter: part.nozzleDiameter,
        filamentType: part.filamentType,
        color: part.color,
        machine: part.machine
      }));

      setProgress(60);
      setCurrentStep('Dateien werden hochgeladen...');

      // Step 4: Prepare preview image
      let previewImageFile = null;
      if (multiImageUpload.images.length > 0) {
        previewImageFile = multiImageUpload.images[0].file;
      }

      console.log('📦 [AddDesignForm] Starting save with:');
      console.log('  - Product data:', data);
      console.log('  - Parts:', mappedDesignParts.length);
      console.log('  - Files:', selectedFiles.length);
      console.log('  - Preview image:', !!previewImageFile);

      setProgress(80);
      setCurrentStep('Daten werden gespeichert...');

      // Step 5: Save everything
      await saveDesignAsProductWithFiles(
        data,
        mappedDesignParts,
        selectedFiles,
        previewImageFile || undefined,
        multiImageUpload.images
      );

      setProgress(100);
      setCurrentStep('Erfolgreich gespeichert!');

      toast({
        title: "Produkt gespeichert",
        description: `Das Produkt "${data.name}" wurde erfolgreich mit ${selectedFiles.length} Datei(en) erstellt.`,
      });

      // Close dialog after successful save
      setTimeout(() => {
        onSave();
      }, 1000);
      
    } catch (error) {
      console.error('❌ [AddDesignForm] Save failed:', error);
      
      let errorMessage = "Es gab einen Fehler beim Speichern des Produkts.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Fehler beim Speichern",
        description: errorMessage,
        variant: "destructive",
      });
      
      setProgress(0);
      setCurrentStep('');
    } finally {
      setSaving(false);
    }
  };

  // Get current form values for debug display
  const currentFormData = form.getValues();

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
                    Das Produkt wird mit allen Dateien gespeichert...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Debug Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>🔍 LIVE DEBUG INFO:</strong></p>
            <p><strong>Aktuelle Dateien in Selection:</strong> {selectedFiles.length}</p>
            <p><strong>Formularbereich bereit:</strong> {currentFormData.name ? 'Ja' : 'Nein'}</p>
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
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p><strong>📊 Parts Overview:</strong></p>
              {designParts.designParts.map(part => {
                const partFileCount = selectedFiles.filter(f => f.partId === part.id).length;
                return (
                  <p key={part.id} className={`${partFileCount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    - {part.name} ({part.partType}): {partFileCount} Datei(en)
                  </p>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || selectedFiles.length === 0}>
              {saving ? 'Speichert...' : 'Produkt speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
