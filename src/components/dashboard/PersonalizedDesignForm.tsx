import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Loader2, Image } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface PersonalizedDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

const PersonalizedDesignForm: React.FC<PersonalizedDesignFormProps> = ({ onCancel, onSave }) => {
  const { createDesign } = useDesigns();
  const { uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    eanNumber: '',
    cadFile: null as File | null,
    cadSoftware: '',
    slicer: '',
    iniFile: null as File | null,
    sketchName: '',
    replacementValue: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.cadFile || !formData.cadSoftware || !formData.slicer) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload CAD file
      const cadFilePath = await uploadFile(formData.cadFile, 'cad-files');
      
      // Upload INI file if provided
      let iniFilePath = null;
      if (formData.iniFile) {
        iniFilePath = await uploadFile(formData.iniFile, 'ini-files');
      }

      // Upload preview image if provided
      let previewImagePath = null;
      if (previewImage) {
        previewImagePath = await uploadFile(previewImage, 'preview-images');
      }

      await createDesign({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        design_type: 'personalized',
        ean_number: formData.eanNumber || null,
        cad_software: formData.cadSoftware,
        slicer: formData.slicer,
        sketch_name: formData.sketchName || null,
        replacement_value: formData.replacementValue || null,
        cad_file_path: cadFilePath,
        ini_file_path: iniFilePath,
        preview_image_path: previewImagePath
      });

      onSave(formData);
    } catch (error) {
      console.error('Error saving design:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Personalisierbares Design hinzufügen</CardTitle>
        <CardDescription>
          Laden Sie Ihre CAD-Datei hoch und konfigurieren Sie die Personalisierungseinstellungen
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

          {/* EAN Number */}
          <div className="space-y-2">
            <Label htmlFor="eanNumber">EAN-Nummer</Label>
            <Input
              id="eanNumber"
              placeholder="13-stellige EAN-Nummer eingeben"
              value={formData.eanNumber}
              onChange={(e) => handleInputChange('eanNumber', e.target.value)}
              maxLength={13}
            />
            <p className="text-sm text-gray-600">
              Die EAN-Nummer wird für die automatische Produkterkennung verwendet
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
            <Select onValueChange={(value) => handleSelectChange('category', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mechanical">Mechanische Teile</SelectItem>
                <SelectItem value="household">Haushalt</SelectItem>
                <SelectItem value="toys">Spielzeug</SelectItem>
                <SelectItem value="tools">Werkzeuge</SelectItem>
                <SelectItem value="decorative">Dekoration</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CAD File Upload */}
          <div className="space-y-2">
            <Label htmlFor="cadFile">CAD-Datei *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {formData.cadFile ? formData.cadFile.name : 'Klicken Sie hier oder ziehen Sie Ihre CAD-Datei hinein'}
              </p>
              <Input
                id="cadFile"
                type="file"
                accept=".f3d,.sldprt,.blend,.step,.stl"
                onChange={(e) => handleFileChange('cadFile', e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cadFile')?.click()}
              >
                Datei auswählen
              </Button>
            </div>
          </div>

          {/* CAD Software */}
          <div className="space-y-2">
            <Label htmlFor="cadSoftware">CAD-Software *</Label>
            <Select onValueChange={(value) => handleSelectChange('cadSoftware', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="CAD-Software auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fusion360">Fusion 360</SelectItem>
                <SelectItem value="solidworks">SolidWorks</SelectItem>
                <SelectItem value="blender">Blender</SelectItem>
                <SelectItem value="freecad">FreeCAD</SelectItem>
                <SelectItem value="onshape">Onshape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Slicer */}
          <div className="space-y-2">
            <Label htmlFor="slicer">Slicer *</Label>
            <Select onValueChange={(value) => handleSelectChange('slicer', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Slicer auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prusaslicer">PrusaSlicer</SelectItem>
                <SelectItem value="bambuuslicer">Bambu Studio</SelectItem>
                <SelectItem value="orcaslicer">OrcaSlicer</SelectItem>
                <SelectItem value="cura">Cura</SelectItem>
                <SelectItem value="superslicer">SuperSlicer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* INI File Upload */}
          <div className="space-y-2">
            <Label htmlFor="iniFile">Slicer-Konfiguration (INI-Datei)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {formData.iniFile ? formData.iniFile.name : 'Slicer-Konfigurationsdatei hochladen'}
              </p>
              <Input
                id="iniFile"
                type="file"
                accept=".ini,.3mf,.json"
                onChange={(e) => handleFileChange('iniFile', e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('iniFile')?.click()}
              >
                INI-Datei auswählen
              </Button>
            </div>
          </div>

          <Separator />

          {/* Parameter Mapping Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium">Parameter-Zuordnung</h4>
              <p className="text-sm text-gray-600">Definieren Sie, welche Sketch-Parameter angepasst werden können</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sketchName">Sketch-Name</Label>
              <Input
                id="sketchName"
                placeholder="Geben Sie den Namen des zu ersetzenden Sketches ein"
                value={formData.sketchName}
                onChange={(e) => handleInputChange('sketchName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="replacementValue">Ersetzungsparameter</Label>
              <Input
                id="replacementValue"
                placeholder="Geben Sie ein, was in der Datei ersetzt werden soll"
                value={formData.replacementValue}
                onChange={(e) => handleInputChange('replacementValue', e.target.value)}
              />
            </div>
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
                  {uploading ? 'Dateien hochladen...' : 'Speichern...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Produkt erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalizedDesignForm;
