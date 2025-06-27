
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMachines } from '@/hooks/useMachines';
import { useDesigns } from '@/hooks/useDesigns';
import { useSimpleFileUpload } from '@/hooks/useSimpleFileUpload';
import DesignInformationSection from './design-edit/DesignInformationSection';
import SimpleFileUpload from '@/components/SimpleFileUpload';
import PreviewImageUpload from './design-edit/MultiImageUpload';

interface PersonalizedDesignFormData {
  name: string;
  description: string;
  category: string;
  trackingType: string;
  eanNumber: string;
  color: string;
  machine: string;
  cadSoftware: string;
  slicer: string;
  nozzleDiameter: string;
  material: string;
  sketchName?: string;
  replacementValue?: string;
}

interface ImageFile {
  file: File;
  id: string;
  preview: string;
}

const PersonalizedDesignForm: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<PersonalizedDesignFormData>();
  const [multiImages, setMultiImages] = useState<ImageFile[]>([]);
  const { createDesign } = useDesigns();
  const { machines } = useMachines();
  const { uploadedFiles, clearAllFiles } = useSimpleFileUpload();

  const onSubmit = async (data: PersonalizedDesignFormData) => {
    try {
      console.log('🚀 Saving personalized design...');
      console.log('Form data:', data);
      console.log('Uploaded files:', uploadedFiles);

      // Get file paths by category
      const cadFile = uploadedFiles.find(f => f.fileCategory === 'CAD');
      const iniFile = uploadedFiles.find(f => f.fileCategory === 'INI');
      const gcodeFile = uploadedFiles.find(f => f.fileCategory === 'GCODE');

      const designData = {
        name: data.name,
        description: data.description,
        category: data.category,
        design_type: data.trackingType as 'static' | 'personalized',
        ean_number: data.eanNumber,
        tracking_type: data.trackingType,
        cad_software: data.cadSoftware,
        slicer: data.slicer,
        sketch_name: data.sketchName,
        replacement_value: data.replacementValue,
        cad_file_path: cadFile?.path,
        ini_file_path: iniFile?.path,
        gcode_file_path: gcodeFile?.path,
        nozzle_diameter: data.nozzleDiameter,
        material: data.material,
        color: data.color,
        machine: data.machine,
        version: 'v1.0'
      };

      console.log('Design data to save:', designData);

      await createDesign(designData);

      toast({
        title: "Design erfolgreich gespeichert",
        description: `Das Design "${data.name}" wurde erfolgreich erstellt.`,
      });

      // Reset form and clear files
      form.reset();
      setMultiImages([]);
      clearAllFiles();

    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Das Design konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleImagesChange = (images: ImageFile[]) => {
    setMultiImages(images);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newImages: ImageFile[] = imageFiles.map(file => ({
      file,
      id: Date.now() + Math.random() + '',
      preview: URL.createObjectURL(file)
    }));
    
    setMultiImages(prev => [...prev, ...newImages]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const newImages: ImageFile[] = imageFiles.map(file => ({
      file,
      id: Date.now() + Math.random() + '',
      preview: URL.createObjectURL(file)
    }));
    
    setMultiImages(prev => [...prev, ...newImages]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personalisiertes Design erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DesignInformationSection 
              control={form.control as any}
              trackingType="personalized"
              categories={[]}
              editingCategory={null}
              editingCategoryValue=""
              showAddCategoryDialog={false}
              newCategoryName=""
              images={multiImages}
              onStartEditCategory={() => {}}
              onSaveEditCategory={() => {}}
              onCancelEditCategory={() => {}}
              onAddCategory={() => {}}
              onSaveNewCategory={() => {}}
              onCancelAddCategory={() => {}}
              onDeleteCategory={() => {}}
              onImageDrop={handleImageDrop}
              onImageUpload={handleImageUpload}
              onImagesChange={handleImagesChange}
              setEditingCategoryValue={() => {}}
              setNewCategoryName={() => {}}
              setShowAddCategoryDialog={() => {}}
              getValues={form.getValues}
            />

            <PreviewImageUpload
              images={multiImages}
              onImagesChange={handleImagesChange}
              onImageDrop={handleImageDrop}
              onImageUpload={handleImageUpload}
            />

            <SimpleFileUpload />

            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                Produkt speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default PersonalizedDesignForm;
