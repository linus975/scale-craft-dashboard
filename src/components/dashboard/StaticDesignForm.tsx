
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save, Loader2 } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useToast } from '@/hooks/use-toast';

interface StaticDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

const StaticDesignForm: React.FC<StaticDesignFormProps> = ({ onCancel, onSave }) => {
  const { createDesign } = useDesigns();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    gcode: '',
    nozzle_diameter: '',
    material: '',
    colors: '',
    ean_number: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.gcode) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await createDesign({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        design_type: 'static',
        gcode: formData.gcode,
        nozzle_diameter: formData.nozzle_diameter || null,
        material: formData.material || null,
        colors: formData.colors || null,
        ean_number: formData.ean_number || null
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Statisches Design hinzufügen</CardTitle>
        <CardDescription>
          Laden Sie Ihren G-Code hoch und konfigurieren Sie die Druckeinstellungen für dieses statische Design
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
            <Select onValueChange={(value) => handleInputChange('category', value)} required>
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

          {/* G-code Upload */}
          <div className="space-y-2">
            <Label htmlFor="gcode">G-Code *</Label>
            <Textarea
              id="gcode"
              placeholder="Fügen Sie Ihren G-Code hier ein..."
              value={formData.gcode}
              onChange={(e) => handleInputChange('gcode', e.target.value)}
              className="min-h-32 font-mono text-sm"
              required
            />
          </div>

          {/* Nozzle Diameter */}
          <div className="space-y-2">
            <Label htmlFor="nozzleDiameter">Düsendurchmesser</Label>
            <Select onValueChange={(value) => handleInputChange('nozzle_diameter', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Düsendurchmesser wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.2">0.2 mm</SelectItem>
                <SelectItem value="0.3">0.3 mm</SelectItem>
                <SelectItem value="0.4">0.4 mm</SelectItem>
                <SelectItem value="0.6">0.6 mm</SelectItem>
                <SelectItem value="0.8">0.8 mm</SelectItem>
                <SelectItem value="1.0">1.0 mm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Material */}
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Select onValueChange={(value) => handleInputChange('material', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Druckmaterial wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pla">PLA</SelectItem>
                <SelectItem value="abs">ABS</SelectItem>
                <SelectItem value="petg">PETG</SelectItem>
                <SelectItem value="tpu">TPU</SelectItem>
                <SelectItem value="wood">Wood Fill</SelectItem>
                <SelectItem value="metal">Metal Fill</SelectItem>
                <SelectItem value="carbon">Carbon Fiber</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label htmlFor="colors">Farben</Label>
            <Input
              id="colors"
              placeholder="z.B. Rot, Blau, Weiß (kommagetrennt)"
              value={formData.colors}
              onChange={(e) => handleInputChange('colors', e.target.value)}
            />
          </div>

          {/* EAN Number */}
          <div className="space-y-2">
            <Label htmlFor="eanNumber">EAN-Nummer</Label>
            <Input
              id="eanNumber"
              placeholder="EAN/UPC-Code für Datenbank-Zuordnung eingeben"
              value={formData.ean_number}
              onChange={(e) => handleInputChange('ean_number', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
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
