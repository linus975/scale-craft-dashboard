
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, Settings2, Plus, Edit, Trash } from 'lucide-react';
import PresetManager from './PresetManager';

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

interface DesignPart {
  id: string;
  name: string;
  partType?: 'static' | 'personalized';
}

interface FileManagementSectionProps {
  data: FileManagementData;
  onChange: (data: FileManagementData) => void;
  designParts: DesignPart[];
  activePart: string;
  onPartChange: (partId: string) => void;
  onAddPart: (name: string) => void;
  onRemovePart: (partId: string) => void;
  onRenamePart: (partId: string, newName: string) => void;
  onPartTypeChange: (partId: string, partType: 'static' | 'personalized') => void;
  colorPresets: string[];
  machinePresets: string[];
  filamentPresets: string[];
  onAddColorPreset: (color: string) => void;
  onEditColorPreset: (oldColor: string, newColor: string) => void;
  onDeleteColorPreset: (color: string) => void;
  onAddMachinePreset: (machine: string) => void;
  onEditMachinePreset: (oldMachine: string, newMachine: string) => void;
  onDeleteMachinePreset: (machine: string) => void;
  onAddFilamentPreset: (filament: string) => void;
  onEditFilamentPreset: (oldFilament: string, newFilament: string) => void;
  onDeleteFilamentPreset: (filament: string) => void;
}

const FileManagementSection: React.FC<FileManagementSectionProps> = ({ 
  data, 
  onChange, 
  designParts,
  activePart,
  onPartChange,
  onAddPart,
  onRemovePart,
  onRenamePart,
  onPartTypeChange,
  colorPresets,
  machinePresets,
  filamentPresets,
  onAddColorPreset,
  onEditColorPreset,
  onDeleteColorPreset,
  onAddMachinePreset,
  onEditMachinePreset,
  onDeleteMachinePreset,
  onAddFilamentPreset,
  onEditFilamentPreset,
  onDeleteFilamentPreset
}) => {
  const [gcodeFile, setGcodeFile] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [iniFile, setIniFile] = useState<File | null>(null);
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editPartName, setEditPartName] = useState('');

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

  const handleAddPart = () => {
    if (newPartName.trim()) {
      onAddPart(newPartName.trim());
      setNewPartName('');
      setShowAddPartDialog(false);
    }
  };

  const handleEditPart = (partId: string, currentName: string) => {
    setEditingPart(partId);
    setEditPartName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingPart && editPartName.trim()) {
      onRenamePart(editingPart, editPartName.trim());
      setEditingPart(null);
      setEditPartName('');
    }
  };

  const handlePartTypeChange = (value: 'static' | 'customisable') => {
    updateData('partType', value);
    const mappedType = value === 'static' ? 'static' : 'personalized';
    onPartTypeChange(activePart, mappedType);
  };

  const currentPart = designParts.find(part => part.id === activePart);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          File Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* First Row: Select Part with Controls and Part Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Part</Label>
            <div className="flex gap-2">
              <Select value={activePart} onValueChange={onPartChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select part" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {designParts.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      {part.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Part Management Controls */}
              <div className="flex gap-1">
                <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Part</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Part Name</Label>
                        <Input
                          placeholder="Enter part name"
                          value={newPartName}
                          onChange={(e) => setNewPartName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPart} disabled={!newPartName.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={editingPart !== null} onOpenChange={(open) => !open && setEditingPart(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 w-10 p-0"
                      onClick={() => currentPart && handleEditPart(currentPart.id, currentPart.name)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Part Name</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Part Name</Label>
                        <Input
                          placeholder="Enter part name"
                          value={editPartName}
                          onChange={(e) => setEditPartName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingPart(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={!editPartName.trim()}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 w-10 p-0"
                  onClick={() => onRemovePart(activePart)}
                  disabled={designParts.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Part Type</Label>
            <Select value={data.partType} onValueChange={handlePartTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select part type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="customisable">Customisable</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectContent className="bg-white">
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
                <SelectContent className="bg-white">
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
          <PresetManager
            label="Color"
            value={data.partColor}
            onValueChange={(value) => updateData('partColor', value)}
            presets={colorPresets}
            onAddPreset={onAddColorPreset}
            onEditPreset={onEditColorPreset}
            onDeletePreset={onDeleteColorPreset}
            placeholder="Select or add color"
          />

          <PresetManager
            label="Machine Type"
            value={data.machineType}
            onValueChange={(value) => updateData('machineType', value)}
            presets={machinePresets}
            onAddPreset={onAddMachinePreset}
            onEditPreset={onEditMachinePreset}
            onDeletePreset={onDeleteMachinePreset}
            placeholder="Select or add machine"
          />
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
                <SelectContent className="bg-white">
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

          <PresetManager
            label="Filament Type"
            value={data.filamentType}
            onValueChange={(value) => updateData('filamentType', value)}
            presets={filamentPresets}
            onAddPreset={onAddFilamentPreset}
            onEditPreset={onEditFilamentPreset}
            onDeletePreset={onDeleteFilamentPreset}
            placeholder="Select or add filament"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManagementSection;
