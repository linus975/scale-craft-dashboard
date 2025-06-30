
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDesignToProduct } from '@/hooks/useDesignToProduct';
import { useDirectFileUpload } from '@/hooks/useDirectFileUpload';
import { useFileSelection } from '@/hooks/useFileSelection';
import { supabase } from '@/integrations/supabase/client';
import PartTypeFileUpload from './design-edit/PartTypeFileUpload';

interface StaticDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

interface DesignPart {
  id: string;
  name: string;
  type: 'static' | 'personalizable';
}

const StaticDesignForm: React.FC<StaticDesignFormProps> = ({ onCancel, onSave }) => {
  const { saveDesignAsProduct } = useDesignToProduct();
  const { uploading, uploadFiles } = useDirectFileUpload();
  const { selectedFiles, addFiles, removeFile, getFilesForPart } = useFileSelection();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [selectedPartId, setSelectedPartId] = useState('main');
  const [designParts, setDesignParts] = useState<DesignPart[]>([
    { id: 'main', name: 'Main', type: 'static' }
  ]);
  
  const [formData, setFormData] = useState({
    name: '',
    trackingType: 'ean' as 'ean' | 'sku',
    trackingNumber: '',
    description: '',
    category: '',
    color: '',
    machine: '',
    material: '',
    nozzleDiameter: '',
    cadSoftware: '',
    slicer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [StaticDesignForm] Form submission started...');
    
    // Enhanced validation with logging
    if (!formData.name || !formData.trackingNumber || !formData.category) {
      console.error('❌ [StaticDesignForm] Missing required fields:', {
        name: !!formData.name,
        trackingNumber: !!formData.trackingNumber,
        category: !!formData.category
      });
      
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus (Name, Tracking-Nummer und Kategorie).",
        variant: "destructive",
      });
      return;
    }

    console.log('📋 [StaticDesignForm] Form data:', formData);
    console.log('📁 [StaticDesignForm] Selected files:', selectedFiles.length);

    setLoading(true);
    try {
      // Step 1: Upload all selected files
      const uploadedFilesList = [];
      
      if (selectedFiles.length > 0) {
        console.log('📤 [StaticDesignForm] Starting file uploads...');
        
        // Group files by part
        const filesByPart = selectedFiles.reduce((acc, selectedFile) => {
          if (!acc[selectedFile.partId]) {
            acc[selectedFile.partId] = [];
          }
          acc[selectedFile.partId].push(selectedFile.file);
          return acc;
        }, {} as Record<string, File[]>);

        // Upload files for each part
        for (const [partId, files] of Object.entries(filesByPart)) {
          console.log(`📤 [StaticDesignForm] Uploading ${files.length} files for part: ${partId}`);
          const uploadedForPart = await uploadFiles(files, partId);
          uploadedFilesList.push(...uploadedForPart);
        }
        
        console.log('✅ [StaticDesignForm] All files uploaded:', uploadedFilesList.length);
      }

      // Step 2: Create product with design parts
      const designFormData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        trackingType: formData.trackingType,
        eanNumber: formData.trackingNumber,
        color: formData.color,
        machine: formData.machine,
        material: formData.material,
        nozzleDiameter: formData.nozzleDiameter,
        cadSoftware: formData.cadSoftware,
        slicer: formData.slicer
      };

      const designPartsForSaving = designParts.map(part => ({
        id: part.id,
        name: part.name,
        type: part.type,
        software: formData.cadSoftware,
        specifications: ''
      }));

      console.log('💾 [StaticDesignForm] Calling saveDesignAsProduct...');
      const product = await saveDesignAsProduct(
        designFormData,
        designPartsForSaving,
        uploadedFilesList,
        previewImage || undefined,
        []
      );

      console.log('✅ [StaticDesignForm] Product created successfully:', product);
      console.log('🎉 [StaticDesignForm] All operations completed successfully');
      onSave(formData);
      
    } catch (error) {
      console.error('❌ [StaticDesignForm] Complete error:', error);
      
      toast({
        title: "Speichern fehlgeschlagen",
        description: `Fehler beim Speichern des Produkts: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File | null) => {
    setPreviewImage(file);
  };

  const addNewPart = () => {
    const newPartId = `part-${Date.now()}`;
    const newPart: DesignPart = {
      id: newPartId,
      name: `Part ${designParts.length + 1}`,
      type: 'static'
    };
    setDesignParts(prev => [...prev, newPart]);
    setSelectedPartId(newPartId);
  };

  const updatePartType = (partId: string, type: 'static' | 'personalizable') => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId ? { ...part, type } : part
    ));
  };

  const currentPart = designParts.find(p => p.id === selectedPartId) || designParts[0];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Produkt hinzufügen</CardTitle>
          <CardDescription>
            Erstellen Sie ein neues Produkt. Dateien werden beim Speichern hochgeladen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Design Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Produkt-Name *</Label>
              <Input
                id="name"
                placeholder="Geben Sie einen Namen für Ihr Produkt ein"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Tracking Type and Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingType">Tracking-Typ *</Label>
                <Select onValueChange={(value) => handleInputChange('trackingType', value)} value={formData.trackingType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie den Tracking-Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ean">EAN-Nummer</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNumber">
                  {formData.trackingType === 'ean' ? 'EAN-Nummer *' : 'SKU *'}
                </Label>
                <Input
                  id="trackingNumber"
                  placeholder={formData.trackingType === 'ean' ? '13-stellige EAN-Nummer eingeben' : 'SKU eingeben'}
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                  maxLength={formData.trackingType === 'ean' ? 13 : undefined}
                  required
                />
              </div>
            </div>

            {/* Preview Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="previewImage">Vorschaubild (optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {previewImage ? previewImage.name : 'Klicken Sie hier oder ziehen Sie ein Bild hinein'}
                </p>
                <Input
                  id="previewImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('previewImage')?.click()}
                >
                  Bild auswählen
                </Button>
              </div>
            </div>

            {/* Description and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Beschreiben Sie Ihr Produkt..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Input
                  id="category"
                  placeholder="Kategorie eingeben oder auswählen"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Part Management */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Parts verwalten</Label>
                <Button type="button" variant="outline" onClick={addNewPart}>
                  + Neues Part hinzufügen
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Part auswählen</Label>
                  <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {designParts.map(part => (
                        <SelectItem key={part.id} value={part.id}>
                          {part.name} ({part.type === 'static' ? 'Statisch' : 'Personalisierbar'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Part-Typ</Label>
                  <Select 
                    value={currentPart?.type} 
                    onValueChange={(value: 'static' | 'personalizable') => updatePartType(selectedPartId, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Statisch</SelectItem>
                      <SelectItem value="personalizable">Personalisierbar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* File Upload for Selected Part */}
            {currentPart && (
              <PartTypeFileUpload
                partId={currentPart.id}
                partName={currentPart.name}
                partType={currentPart.type}
                selectedFiles={getFilesForPart(currentPart.id)}
                onFileSelect={addFiles}
                onFileRemove={removeFile}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700" 
                disabled={loading || uploading}
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? 'Dateien hochladen...' : 'Speichern...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Produkt speichern
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaticDesignForm;
