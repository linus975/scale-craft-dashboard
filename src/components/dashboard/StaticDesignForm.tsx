
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Image } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import MultiPartFileManager from './design-edit/MultiPartFileManager';

interface StaticDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
}

const StaticDesignForm: React.FC<StaticDesignFormProps> = ({ onCancel, onSave }) => {
  const { createDesign } = useDesigns();
  const { uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('main');
  
  const [formData, setFormData] = useState({
    name: '',
    trackingType: 'ean' as 'ean' | 'sku',
    trackingNumber: '',
    description: '',
    category: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there's at least one G-code file
    const gcodeFiles = uploadedFiles.filter(f => f.name.toLowerCase().endsWith('.gcode') || f.name.toLowerCase().endsWith('.g'));
    
    if (!formData.name || !formData.trackingNumber || !formData.category || gcodeFiles.length === 0) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus und laden Sie mindestens eine G-Code Datei hoch.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use the first G-code file as the main one
      const mainGcodeFile = gcodeFiles[0];

      // Upload preview image if provided
      let previewImagePath = null;
      if (previewImage) {
        previewImagePath = await uploadFile(previewImage, 'preview-images');
      }

      await createDesign({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        design_type: 'static',
        gcode_file_path: mainGcodeFile.path,
        ean_number: formData.trackingNumber,
        tracking_type: formData.trackingType,
        preview_image_path: previewImagePath
      });

      onSave(formData);
    } catch (error) {
      console.error('Error saving design:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, partId: string = 'main') => {
    const files = event.target.files;
    if (!files) return;

    try {
      for (const file of Array.from(files)) {
        const fileName = partId === 'main' ? file.name : `part-${partId}_${file.name}`;
        
        const filePath = await uploadFile(
          new File([file], fileName, { type: file.type }), 
          `temp-designs`
        );
        
        const newFile: UploadedFile = {
          id: Date.now() + Math.random() + '',
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: filePath,
          originalName: file.name,
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
        <CardTitle>Statisches Design hinzufügen</CardTitle>
        <CardDescription>
          Laden Sie Ihre G-Code Datei hoch und konfigurieren Sie die Druckeinstellungen für dieses statische Design
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Design Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Design-Name *</Label>
            <Input
              id="name"
              placeholder="Geben Sie einen Namen für Ihr Design ein"
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
            <Label htmlFor="previewImage">Vorschaubild</Label>
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
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Beschreiben Sie Ihr Design..."
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

          {/* Multi-Part File Management */}
          <MultiPartFileManager
            uploadedFiles={uploadedFiles}
            loadingFiles={false}
            uploading={uploading}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            onFileDownload={handleFileDownload}
            isPersonalized={false}
            selectedPartId={selectedPartId}
            onPartSelect={setSelectedPartId}
          />

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
                  Design speichern
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
