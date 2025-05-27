
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save } from 'lucide-react';

interface PersonalizedDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

const PersonalizedDesignForm: React.FC<PersonalizedDesignFormProps> = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    cadFile: null as File | null,
    cadSoftware: '',
    slicer: '',
    iniFile: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Personalized design form data:', formData);
    onSave(formData);
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Personalized Design</CardTitle>
        <CardDescription>
          Upload your CAD file and configure personalization settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CAD File Upload */}
          <div className="space-y-2">
            <Label htmlFor="cadFile">CAD File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {formData.cadFile ? formData.cadFile.name : 'Click to upload or drag and drop your CAD file'}
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
                Choose File
              </Button>
            </div>
          </div>

          {/* CAD Software */}
          <div className="space-y-2">
            <Label htmlFor="cadSoftware">CAD Software</Label>
            <Select onValueChange={(value) => handleSelectChange('cadSoftware', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select CAD software" />
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
            <Label htmlFor="slicer">Slicer</Label>
            <Select onValueChange={(value) => handleSelectChange('slicer', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select slicer" />
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
            <Label htmlFor="iniFile">Slicer Configuration (INI File)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {formData.iniFile ? formData.iniFile.name : 'Upload slicer configuration file'}
              </p>
              <Input
                id="iniFile"
                type="file"
                accept=".ini,.3mf,.json"
                onChange={(e) => handleFileChange('iniFile', e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('iniFile')?.click()}
              >
                Choose INI File
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalizedDesignForm;
