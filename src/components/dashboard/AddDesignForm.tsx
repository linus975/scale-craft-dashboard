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
import { useDirectStorageUpload } from '@/hooks/useDirectStorageUpload';
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
  const { uploadFileToStorage, uploading: storageUploading } = useDirectStorageUpload();
  const { createProduct, createPart, createProductImage } = useProducts();
  const { selectedFiles, uploadSelectedFiles, getAllFiles } = useFileSelection();
  
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
    if (saving || storageUploading) return;
    
    console.log('🚀 [AddDesignForm] Starting save process with STORAGE UPLOAD...');
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

      setProgress(30);
      setCurrentStep('Produkt wird erstellt...');

      // Step 3: Create the product first
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

      setProgress(40);
      setCurrentStep('Dateien werden ins Storage hochgeladen...');

      // Step 4: Upload all selected files to storage
      console.log('📤 [AddDesignForm] Uploading selected files to storage...');
      const uploadedFiles = await uploadSelectedFiles(data.name);
      console.log('✅ [AddDesignForm] All files uploaded to storage successfully');

      setProgress(60);
      setCurrentStep('Parts werden erstellt...');

      // Step 5: Process each part and create database records
      for (const partData of designParts.designParts) {
        console.log(`🔧 [AddDesignForm] Processing part: ${partData.name} (ID: ${partData.id})`);
        
        // Get uploaded files for this specific part
        const partFiles = uploadedFiles.filter(f => f.partId === partData.id);
        console.log(`📁 [AddDesignForm] Found ${partFiles.length} uploaded files for part ${partData.name}:`, 
          partFiles.map(f => `${f.file.name} (${f.fileCategory}) -> ${f.storagePath}`));

        // Initialize file paths from uploaded files
        let gcodeFilePath = null;
        let cadFilePath = null;
        let iniFilePath = null;

        // Map uploaded files to correct paths
        for (const uploadedFile of partFiles) {
          switch (uploadedFile.fileCategory) {
            case 'GCODE':
              gcodeFilePath = uploadedFile.storagePath;
              console.log(`✅ [AddDesignForm] G-Code path set: ${gcodeFilePath}`);
              break;
            case 'CAD':
              cadFilePath = uploadedFile.storagePath;
              console.log(`✅ [AddDesignForm] CAD path set: ${cadFilePath}`);
              break;
            case 'INI':
              iniFilePath = uploadedFile.storagePath;
              console.log(`✅ [AddDesignForm] INI path set: ${iniFilePath}`);
              break;
          }
        }

        // Create part record with uploaded file paths
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
          // File paths from uploaded files
          gcode_path: gcodeFilePath,
          f3d_file_path: cadFilePath,
          ini_file_path: iniFilePath
        };

        console.log('💾 [AddDesignForm] Creating part with uploaded file paths:', {
          part_name: partToCreate.part_name,
          gcode_path: partToCreate.gcode_path,
          f3d_file_path: partToCreate.f3d_file_path,
          ini_file_path: partToCreate.ini_file_path
        });

        const createdPart = await createPart(partToCreate);
        console.log('✅ [AddDesignForm] Part created successfully:', createdPart);
      }

      setProgress(80);
      setCurrentStep('Bilder werden verarbeitet...');

      // Step 6: Handle preview image upload
      if (multiImageUpload.images.length > 0) {
        console.log('🖼️ [AddDesignForm] Processing preview image');
        try {
          const previewImage = multiImageUpload.images[0];
          const previewUpload = await uploadFileToStorage(
            previewImage.file,
            data.name,
            'preview',
            'preview',
            'CAD' // Use CAD as generic category for images
          );
          
          await createProductImage({
            product_id: product.product_id,
            image_path: previewUpload.path,
            is_preview_image: true
          });
          console.log('✅ [AddDesignForm] Preview image saved');
        } catch (imageError) {
          console.warn('⚠️ [AddDesignForm] Preview image upload failed:', imageError);
          // Don't fail the entire process for image upload issues
        }
      }

      // Handle additional images
      for (let i = 1; i < multiImageUpload.images.length; i++) {
        const image = multiImageUpload.images[i];
        console.log(`🖼️ [AddDesignForm] Processing additional image ${i}/${multiImageUpload.images.length - 1}`);
        try {
          const imageUpload = await uploadFileToStorage(
            image.file,
            data.name,
            `image-${i}`,
            `image-${i}`,
            'CAD' // Use CAD as generic category for images
          );
          
          await createProductImage({
            product_id: product.product_id,
            image_path: imageUpload.path,
            is_preview_image: false
          });
          console.log(`✅ [AddDesignForm] Additional image ${i} saved`);
        } catch (imageError) {
          console.warn(`⚠️ [AddDesignForm] Additional image ${i} upload failed:`, imageError);
          // Don't fail the entire process for image upload issues
        }
      }

      setProgress(100);
      setCurrentStep('Erfolgreich gespeichert!');

      console.log('✅ [AddDesignForm] ALL STORAGE operations completed successfully');
      
      toast({
        title: "Produkt erfolgreich erstellt",
        description: `Das Produkt "${data.name}" wurde mit ${selectedFiles.length} Datei(en) im Storage gespeichert.`,
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

          {/* File Management Section with storage upload */}
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
          {(saving || storageUploading) && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">
                      {storageUploading ? 'Dateien werden ins Storage hochgeladen...' : currentStep}
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Das Produkt wird mit allen Dateien im Supabase Storage gespeichert...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Debug Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>🔍 STORAGE UPLOAD DEBUG INFO:</strong></p>
            <p><strong>Aktuelle Dateien in Selection:</strong> {selectedFiles.length}</p>
            <p><strong>Formularbereich bereit:</strong> {currentFormData.name ? 'Ja' : 'Nein'}</p>
            <p><strong>Speicher-Status:</strong> {saving ? 'Läuft...' : 'Bereit'}</p>
            <p><strong>Storage Upload-Status:</strong> {storageUploading ? 'Läuft...' : 'Bereit'}</p>
            {selectedFiles.length > 0 && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p><strong>✅ Dateien bereit für Storage Upload:</strong></p>
                {selectedFiles.map((file, index) => (
                  <p key={file.id} className="text-green-700">
                    {index + 1}. {file.file.name} (Part: {file.partId}, Typ: {file.fileCategory})
                    {file.uploaded && file.storagePath && (
                      <span className="text-green-600 ml-2">→ {file.storagePath}</span>
                    )}
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving || storageUploading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || storageUploading || selectedFiles.length === 0}>
              {(saving || storageUploading) ? 'Speichert...' : 'Produkt speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
