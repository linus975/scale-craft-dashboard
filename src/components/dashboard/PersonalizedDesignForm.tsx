import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDesignParts } from '@/hooks/useDesignParts';
import { usePartSpecificFileUpload } from '@/hooks/usePartSpecificFileUpload';
import { useDesignToProduct } from '@/hooks/useDesignToProduct';
import { useMachines } from '@/hooks/useMachines';
import DesignInformationSection from './design-edit/DesignInformationSection';
import FileManagementSection from './design-edit/FileManagementSection';
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

const PersonalizedDesignForm: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<PersonalizedDesignFormData>();
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [multiImages, setMultiImages] = useState<Array<{ file: File }>>([]);

  const {
    designParts,
    activePart,
    handlePartParametersChange,
    handlePartSelect,
    handleAddPart,
    handleRemovePart,
    handleRenamePart,
    handlePartTypeChange,
    handlePartSoftwareChange,
    handlePartSpecificationChange
  } = useDesignParts();

  const {
    partFiles,
    gcodeFiles,
    uploading,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload,
    getFilesForPart,
    getAllFiles,
    handleGcodeFileChange,
    removeGcodeFile,
    getGcodeFileForPart,
    uploadGcodeFile
  } = usePartSpecificFileUpload();

  const { saveDesignAsProduct } = useDesignToProduct();
  const { data: machines = [] } = useMachines();

  const onSubmit = async (data: PersonalizedDesignFormData) => {
    try {
      console.log('🚀 Saving personalized design with part-specific files...');
      
      // Upload all G-code files for all parts
      const uploadPromises = designParts.map(async (part) => {
        try {
          const result = await uploadGcodeFile(part.id);
          return { partId: part.id, ...result };
        } catch (error) {
          console.error(`Error uploading G-code for part ${part.id}:`, error);
          return { partId: part.id, path: null, content: null };
        }
      });

      const gcodeResults = await Promise.all(uploadPromises);
      console.log('G-code upload results:', gcodeResults);

      // Get all uploaded files from all parts
      const allUploadedFiles = getAllFiles();
      console.log('All part files:', allUploadedFiles);

      // Convert design parts with their specific settings
      const convertedParts = designParts.map(part => ({
        id: part.id,
        name: part.name,
        type: part.partType || 'static',
        cadSoftware: part.cadSoftware,
        slicer: part.slicer,
        nozzleDiameter: part.nozzleDiameter,
        filamentType: part.filamentType,
        color: part.color,
        machine: part.machine
      }));

      await saveDesignAsProduct(
        data,
        convertedParts,
        allUploadedFiles,
        previewImage || undefined,
        multiImages
      );

      toast({
        title: "Design erfolgreich gespeichert",
        description: `Das personalisierbare Design "${data.name}" wurde mit allen Teil-spezifischen Dateien gespeichert.`,
      });

      form.reset();
      setPreviewImage(null);
      setMultiImages([]);

    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Das Design konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personalisiertes Design erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DesignInformationSection 
              form={form}
              trackingType="personalized"
            />

            <PreviewImageUpload
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              multiImages={multiImages}
              setMultiImages={setMultiImages}
            />

            <FileManagementSection
              designParts={designParts}
              activePart={activePart}
              partFiles={partFiles}
              gcodeFiles={gcodeFiles}
              uploading={uploading}
              machines={machines}
              onPartSelect={handlePartSelect}
              onAddPart={handleAddPart}
              onRemovePart={handleRemovePart}
              onRenamePart={handleRenamePart}
              onPartTypeChange={handlePartTypeChange}
              onPartSoftwareChange={handlePartSoftwareChange}
              onPartSpecificationChange={handlePartSpecificationChange}
              onPartParametersChange={handlePartParametersChange}
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              onFileDownload={handleFileDownload}
              onGcodeFileChange={handleGcodeFileChange}
              onRemoveGcodeFile={removeGcodeFile}
              getFilesForPart={getFilesForPart}
              getGcodeFileForPart={getGcodeFileForPart}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                {uploading ? 'Speichere...' : 'Produkt speichern'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default PersonalizedDesignForm;
