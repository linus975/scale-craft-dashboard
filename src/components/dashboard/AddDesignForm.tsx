
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
import { useSimpleUpload } from '@/hooks/useSimpleUpload';
import { useProducts } from '@/hooks/useProducts';

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
  const { uploadMultipleFiles } = useSimpleUpload();
  const { createProduct, createPart, createProductImage } = useProducts();
  const { selectedFiles, clearAllFiles, moveFilesToFinal } = useFileSelection();
  
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

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

  // Clean up on unmount or cancel
  useEffect(() => {
    return () => {
      console.log('🧹 [AddDesignForm] Component unmounting, cleaning up');
      multiImageUpload.cleanupPreviews();
    };
  }, []);

  // Handler for cancel - cleanup temp files
  const handleCancel = async () => {
    console.log('❌ [AddDesignForm] Form cancelled, cleaning up temp files');
    await clearAllFiles();
    multiImageUpload.cleanupPreviews();
    onCancel();
  };

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
    
    console.log('🚀 [AddDesignForm] Starting save process with temp files...');
    console.log('📋 [AddDesignForm] Form data:', data);
    console.log('🔧 [AddDesignForm] Design parts:', designParts.designParts);
    console.log('📦 [AddDesignForm] Selected files (temp):', selectedFiles);
    
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

      setProgress(30);
      setCurrentStep('Produkt wird erstellt...');

      // Step 2: Create the product first
      const productData = {
        name: data.name,
        identifier_type: data.trackingType,
        identifier_value: data.eanNumber,
        category: data.category,
        description: data.description
      };

      console.log('📦 [AddDesignForm] Creating product:', productData);
      const product = await createProduct(productData);
      console.log('✅ [AddDesignForm] Product created with ID:', product.product_id);

      setProgress(50);
      setCurrentStep('Dateien werden von temp zu final verschoben...');

      // Step 3: Move files from temp to final destination
      let movedFiles = [];
      if (selectedFiles.length > 0) {
        try {
          console.log('📦 [AddDesignForm] Moving files from temp to final destination');
          movedFiles = await moveFilesToFinal(data.name);
          console.log('✅ [AddDesignForm] Files moved successfully:', movedFiles.length);
        } catch (moveError) {
          console.error('❌ [AddDesignForm] Error moving files:', moveError);
          throw new Error(`Fehler beim Verschieben der Dateien: ${moveError instanceof Error ? moveError.message : 'Unbekannter Fehler'}`);
        }
      }

      setProgress(70);
      setCurrentStep('Parts werden erstellt...');

      // Step 4: Process parts and create them with final file paths
      for (const partData of designParts.designParts) {
        console.log(`🔧 [AddDesignForm] Processing part: ${partData.name} (ID: ${partData.id})`);
        
        // Get moved files for this specific part
        const partMovedFiles = movedFiles.filter(f => f.partName === partData.id);
        console.log(`📁 [AddDesignForm] Found ${partMovedFiles.length} moved files for part ${partData.name}`);

        // Initialize file paths
        let gcodeFilePath = null;
        let cadFilePath = null;
        let iniFilePath = null;

        // Set file paths based on category
        for (const movedFile of partMovedFiles) {
          switch (movedFile.category) {
            case 'GCODE':
              gcodeFilePath = movedFile.path;
              console.log(`✅ [AddDesignForm] G-Code path set: ${gcodeFilePath}`);
              break;
            case 'CAD':
              cadFilePath = movedFile.path;
              console.log(`✅ [AddDesignForm] CAD path set: ${cadFilePath}`);
              break;
            case 'INI':
              iniFilePath = movedFile.path;
              console.log(`✅ [AddDesignForm] INI path set: ${iniFilePath}`);
              break;
          }
        }

        // Create part record with final file paths
        const partToCreate = {
          product_id: product.product_id,
          part_name: partData.name,
          is_customizable: partData.partType === 'personalizable',
          cad_software: partData.cadSoftware || null,
          slicer_software: partData.slicer || null,
          nozzle_diameter: partData.nozzleDiameter ? parseFloat(partData.nozzleDiameter) : null,
          filament_type: partData.filamentType || null,
          color: partData.color || null,
          printer_model: partData.machine || null,
          // File paths from moved files
          gcode_path: gcodeFilePath,
          f3d_file_path: cadFilePath,
          ini_file_path: iniFilePath
        };

        console.log('💾 [AddDesignForm] Creating part with moved file paths:', {
          part_name: partToCreate.part_name,
          gcode_path: partToCreate.gcode_path,
          f3d_file_path: partToCreate.f3d_file_path,
          ini_file_path: partToCreate.ini_file_path
        });

        const createdPart = await createPart(partToCreate);
        console.log('✅ [AddDesignForm] Part created successfully:', createdPart);
      }

      setProgress(90);
      setCurrentStep('Bilder werden verarbeitet...');

      // Step 5: Handle preview image upload
      if (multiImageUpload.images.length > 0) {
        console.log('🖼️ [AddDesignForm] Processing preview image');
        try {
          const previewImage = multiImageUpload.images[0];
          const previewUpload = await uploadMultipleFiles(
            [{ file: previewImage.file, partName: 'preview', category: 'CAD' as const }],
            data.name
          );
          
          await createProductImage({
            product_id: product.product_id,
            image_path: previewUpload[0].path,
            is_preview_image: true
          });
          console.log('✅ [AddDesignForm] Preview image saved');
        } catch (imageError) {
          console.warn('⚠️ [AddDesignForm] Preview image upload failed:', imageError);
        }
      }

      // Handle additional images
      for (let i = 1; i < multiImageUpload.images.length; i++) {
        const image = multiImageUpload.images[i];
        console.log(`🖼️ [AddDesignForm] Processing additional image ${i}/${multiImageUpload.images.length - 1}`);
        try {
          const imageUpload = await uploadMultipleFiles(
            [{ file: image.file, partName: `image-${i}`, category: 'CAD' as const }],
            data.name
          );
          
          await createProductImage({
            product_id: product.product_id,
            image_path: imageUpload[0].path,
            is_preview_image: false
          });
          console.log(`✅ [AddDesignForm] Additional image ${i} saved`);
        } catch (imageError) {
          console.warn(`⚠️ [AddDesignForm] Additional image ${i} upload failed:`, imageError);
        }
      }

      setProgress(100);
      setCurrentStep('Erfolgreich gespeichert!');

      console.log('✅ [AddDesignForm] ALL operations completed successfully');
      
      const fileCount = selectedFiles.length;
      toast({
        title: "Produkt erfolgreich erstellt",
        description: fileCount > 0 
          ? `Das Produkt "${data.name}" wurde mit ${fileCount} Datei(en) erfolgreich gespeichert.`
          : `Das Produkt "${data.name}" wurde erfolgreich gespeichert.`,
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

          {/* File Management Section with temp upload system */}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Speichert...' : 'Produkt speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
