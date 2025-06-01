
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Image, FileCode } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface StaticDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

const StaticDesignForm: React.FC<StaticDesignFormProps> = ({ onCancel, onSave }) => {
  const { createDesign } = useDesigns();
  const { uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [gcodeFile, setGcodeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trackingType: 'ean' as 'ean' | 'sku',
    trackingNumber: '',
    description: '',
    category: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.trackingNumber || !formData.category || !gcodeFile) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus und laden Sie eine G-Code Datei hoch.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload G-code file
      const gcodeFilePath = await uploadFile(gcodeFile, 'gcode-files');
      
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
        gcode_file_path: gcodeFilePath,
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File | null) => {
    setPreviewImage(file);
  };

  const handleGcodeFileChange = (file: File | null) => {
    setGcodeFile(file);
  };

  return (
    <Card className="max-w-2xl mx-auto">
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
            <p className="text-sm text-gray-600">
              {formData.trackingType === 'ean' 
                ? 'Die EAN-Nummer ist das Hauptelement für das Tracking und ist verpflichtend.'
                : 'Die SKU ist das Hauptelement für das Tracking und ist verpflichtend.'
              }
            </p>
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

          {/* Description */}
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

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategorie *</Label>
            <Input
              id="category"
              placeholder="Kategorie eingeben oder auswählen"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            />
            <p className="text-sm text-gray-600">
              Geben Sie eine neue Kategorie ein oder wählen Sie eine bestehende aus.
            </p>
          </div>

          {/* G-code File Upload */}
          <div className="space-y-2">
            <Label htmlFor="gcodeFile">G-Code Datei *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <FileCode className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {gcodeFile ? gcodeFile.name : 'G-Code Datei (.gcode, .g) hochladen'}
              </p>
              <Input
                id="gcodeFile"
                type="file"
                accept=".gcode,.g,.txt"
                onChange={(e) => handleGcodeFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('gcodeFile')?.click()}
              >
                G-Code Datei auswählen
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Wählen Sie eine G-Code Datei (.gcode, .g, .txt) für das statische Design aus.
            </p>
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
