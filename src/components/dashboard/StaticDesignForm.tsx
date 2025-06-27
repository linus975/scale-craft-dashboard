import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Image } from 'lucide-react';
import { useSimpleFileUpload } from '@/hooks/useSimpleFileUpload';
import { useToast } from '@/hooks/use-toast';
import { useDesignToProduct } from '@/hooks/useDesignToProduct';
import MultiPartFileManager from './design-edit/MultiPartFileManager';

interface StaticDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

// Use the UploadedFile type from useSimpleFileUpload to match the expected interface
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  partId?: string;
}

const StaticDesignForm: React.FC<StaticDesignFormProps> = ({ onCancel, onSave }) => {
  const { uploadFile, uploading } = useSimpleFileUpload();
  const { saveDesignAsProduct } = useDesignToProduct();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('main');
  
  // ... keep existing code (formData state)
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

  // ... keep existing code (handleSubmit function)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.trackingNumber || !formData.category) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus (Name, Tracking-Nummer und Kategorie).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
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

      // Create a simple static part structure
      const designParts = [{
        id: 'main',
        name: 'Main',
        type: 'static' as const,
        software: formData.cadSoftware,
        specifications: ''
      }];

      await saveDesignAsProduct(
        designFormData,
        designParts,
        uploadedFiles,
        previewImage || undefined,
        []
      );

      onSave(formData);
    } catch (error) {
      console.error('Error saving design:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileCategory = (fileName: string): 'CAD' | 'INI' | 'GCODE' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
      case 'step':
      case 'stp':
      case 'iges':
      case 'igs':
      case 'dwg':
      case 'dxf':
      case 'stl':
        return 'CAD';
      case 'ini':
        return 'INI';
      case 'gcode':
      case 'g':
        return 'GCODE';
      default:
        return 'CAD';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, partId: string = 'main') => {
    const files = event.target.files;
    if (!files) return;

    try {
      for (const file of Array.from(files)) {
        const fileName = partId === 'main' ? file.name : `part-${partId}_${file.name}`;
        
        await uploadFile(new File([file], fileName, { type: file.type }));
        
        const newFile: UploadedFile = {
          id: Date.now() + Math.random() + '',
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: `temp/${fileName}`,
          originalName: file.name,
          fileCategory: getFileCategory(file.name), // Add the missing fileCategory property
          partId: partId
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        
        toast({
          title: "Datei hochgeladen",
          description: `${file.name} wurde erfolgreich hochgeladen.`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Die Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    }
    
    event.target.value = '';
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'gcode':
      case 'g':
        return 'G-Code File';
      case 'stl':
        return 'STL File';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'Image File';
      default:
        return 'Unknown';
    }
  };

  const handleFileRemove = (file: UploadedFile) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    toast({
      title: "Datei entfernt",
      description: `${file.name} wurde entfernt.`,
    });
  };

  const handleFileDownload = (file: UploadedFile) => {
    toast({
      title: "Download",
      description: `Download für ${file.name} wird vorbereitet.`,
    });
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Statisches Produkt hinzufügen</CardTitle>
        <CardDescription>
          Erstellen Sie ein neues statisches Produkt. Dateien sind optional und können später hinzugefügt werden.
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

          {/* Additional Product Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Farbe (optional)</Label>
              <Input
                id="color"
                placeholder="z.B. Rot, Blau, Schwarz"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material (optional)</Label>
              <Input
                id="material"
                placeholder="z.B. PLA, ABS, PETG"
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Multi-Part File Management */}
          <div className="space-y-2">
            <Label>Dateien (optional)</Label>
            <p className="text-sm text-gray-600">Sie können Dateien jetzt oder später hinzufügen</p>
            <MultiPartFileManager
              uploadedFiles={uploadedFiles}
              loadingFiles={false}
              uploading={uploading}
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              onFileDownload={handleFileDownload}
              selectedPartId={selectedPartId}
              onPartSelect={setSelectedPartId}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Datei hochladen...' : 'Speichern...'}
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
  );
};

export default StaticDesignForm;
