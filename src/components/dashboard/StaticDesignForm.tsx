
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save } from 'lucide-react';

interface StaticDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

const StaticDesignForm: React.FC<StaticDesignFormProps> = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    gcode: '',
    nozzleDiameter: '',
    material: '',
    colors: '',
    eanNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Static design form data:', formData);
    onSave(formData);
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
        <CardTitle>Add Static Design</CardTitle>
        <CardDescription>
          Upload your G-code and configure print settings for this static design
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* G-code Upload */}
          <div className="space-y-2">
            <Label htmlFor="gcode">G-code</Label>
            <Textarea
              id="gcode"
              placeholder="Paste your G-code here or upload a file..."
              value={formData.gcode}
              onChange={(e) => handleInputChange('gcode', e.target.value)}
              className="min-h-32 font-mono text-sm"
              required
            />
            <Button type="button" variant="outline" size="sm" className="mt-2">
              <Upload className="h-4 w-4 mr-2" />
              Upload G-code File
            </Button>
          </div>

          {/* Nozzle Diameter */}
          <div className="space-y-2">
            <Label htmlFor="nozzleDiameter">Nozzle Diameter</Label>
            <Select onValueChange={(value) => handleInputChange('nozzleDiameter', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select nozzle diameter" />
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
            <Select onValueChange={(value) => handleInputChange('material', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select printing material" />
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
            <Label htmlFor="colors">Colors</Label>
            <Input
              id="colors"
              placeholder="e.g., Red, Blue, White (comma separated)"
              value={formData.colors}
              onChange={(e) => handleInputChange('colors', e.target.value)}
              required
            />
          </div>

          {/* EAN Number */}
          <div className="space-y-2">
            <Label htmlFor="eanNumber">EAN Number</Label>
            <Input
              id="eanNumber"
              placeholder="Enter EAN/UPC code for database mapping"
              value={formData.eanNumber}
              onChange={(e) => handleInputChange('eanNumber', e.target.value)}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Design
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StaticDesignForm;
