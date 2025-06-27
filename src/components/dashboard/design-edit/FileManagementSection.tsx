
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, FileText, Settings2 } from 'lucide-react';

interface FileManagementData {
  selectedPart: string;
  partType: 'static' | 'customisable';
  cadSoftware: string;
  slicerSoftware: string;
  partColor: string;
  machineType: string;
  sketchName: string;
  replacementType: 'text' | 'dimension';
  nozzleDiameter: string;
  filamentType: string;
}

interface FileManagementSectionProps {
  data: FileManagementData;
  onChange: (data: FileManagementData) => void;
}

const colorPresets = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Gray', 'Pink'
];

const machinePresets = [
  'Prusa i3 MK3S+', 'Ender 3', 'Bambu Lab X1 Carbon', 'Ultimaker S3', 'Formlabs Form 3', 'Creality CR-10'
];

const filamentPresets = [
  'PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'HIPS', 'PC', 'Nylon', 'Wood Fill', 'Carbon Fiber'
];

const FileManagementSection: React.FC<FileManagementSectionProps> = ({ data, onChange }) => {
  const [gcodeFile, setGcodeFile] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [iniFile, setIniFile] = useState<File | null>(null);

  const updateData = (field: keyof FileManagementData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleGcodeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGcodeFile(file);
    }
  };

  const handleCadUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCadFile(file);
    }
  };

  const handleIniUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIniFile(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          File Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* First Row: Select Part and Part Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Part</Label>
            <Select value={data.selectedPart} onValueChange={(value) => updateData('selectedPart', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select part" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Part</SelectItem>
                <SelectItem value="support">Support Part</SelectItem>
                <SelectItem value="base">Base Part</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Part Type</Label>
            <RadioGroup
              value={data.partType}
              onValueChange={(value: 'static' | 'customisable') => updateData('partType', value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="static" id="static" />
                <Label htmlFor="static">Static</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customisable" id="customisable" />
                <Label htmlFor="customisable">Customisable</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Conditional Row: CAD and Slicer Software (only for customisable) */}
        {data.partType === 'customisable' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CAD Software</Label>
              <Select value={data.cadSoftware} onValueChange={(value) => updateData('cadSoftware', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CAD software" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fusion360">Fusion 360</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Slicer Software</Label>
              <Select value={data.slicerSoftware} onValueChange={(value) => updateData('slicerSoftware', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select slicer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prusaslicer">PrusaSlicer</SelectItem>
                  <SelectItem value="orcaslicer">OrcaSlicer</SelectItem>
                  <SelectItem value="superslicer">SuperSlicer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Color and Machine Type Row (always visible) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              <Select value={data.partColor} onValueChange={(value) => updateData('partColor', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorPresets.map((color) => (
                    <SelectItem key={color} value={color.toLowerCase()}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Custom color"
                value={data.partColor}
                onChange={(e) => updateData('partColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Machine Type</Label>
            <div className="flex gap-2">
              <Select value={data.machineType} onValueChange={(value) => updateData('machineType', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select machine" />
                </SelectTrigger>
                <SelectContent>
                  {machinePresets.map((machine) => (
                    <SelectItem key={machine} value={machine}>{machine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Custom machine"
                value={data.machineType}
                onChange={(e) => updateData('machineType', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* File Upload Row */}
        {data.partType === 'static' ? (
          // G-Code Upload for Static Parts
          <div className="space-y-2">
            <Label>G-Code File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('gcode-upload')?.click()}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Upload G-Code
                  </Button>
                  <input
                    id="gcode-upload"
                    type="file"
                    accept=".gcode,.g"
                    onChange={handleGcodeUpload}
                    className="hidden"
                  />
                </div>
                {gcodeFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {gcodeFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // CAD and INI File Upload for Customisable Parts
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CAD File (.f3d)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('cad-upload')?.click()}
                    >
                      Upload F3D
                    </Button>
                    <input
                      id="cad-upload"
                      type="file"
                      accept=".f3d"
                      onChange={handleCadUpload}
                      className="hidden"
                    />
                  </div>
                  {cadFile && (
                    <p className="mt-1 text-xs text-gray-600">
                      {cadFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>INI File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('ini-upload')?.click()}
                    >
                      Upload INI
                    </Button>
                    <input
                      id="ini-upload"
                      type="file"
                      accept=".ini"
                      onChange={handleIniUpload}
                      className="hidden"
                    />
                  </div>
                  {iniFile && (
                    <p className="mt-1 text-xs text-gray-600">
                      {iniFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sketch Name and Replacement Type (only for customisable) */}
        {data.partType === 'customisable' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sketch Name</Label>
              <Input
                placeholder="Enter sketch name"
                value={data.sketchName}
                onChange={(e) => updateData('sketchName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Replacement Type</Label>
              <Select value={data.replacementType} onValueChange={(value: 'text' | 'dimension') => updateData('replacementType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="dimension">Dimension</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Nozzle Diameter and Filament Type (always visible) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nozzle Diameter (mm)</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="2.0"
              placeholder="0.4"
              value={data.nozzleDiameter}
              onChange={(e) => updateData('nozzleDiameter', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Filament Type</Label>
            <div className="flex gap-2">
              <Select value={data.filamentType} onValueChange={(value) => updateData('filamentType', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select filament" />
                </SelectTrigger>
                <SelectContent>
                  {filamentPresets.map((filament) => (
                    <SelectItem key={filament} value={filament}>{filament}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Custom filament"
                value={data.filamentType}
                onChange={(e) => updateData('filamentType', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManagementSection;
