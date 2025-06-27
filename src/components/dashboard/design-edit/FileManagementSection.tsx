import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, Settings2, Plus, Edit, Trash } from 'lucide-react';
import { usePresetManager } from '@/hooks/usePresetManager';

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
  onPartTypeChange
}) => {
  const [gcodeFile, setGcodeFile] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [iniFile, setIniFile] = useState<File | null>(null);
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editPartName, setEditPartName] = useState('');

  // Preset management states
  const [showAddColorDialog, setShowAddColorDialog] = useState(false);
  const [showAddMachineDialog, setShowAddMachineDialog] = useState(false);
  const [showAddFilamentDialog, setShowAddFilamentDialog] = useState(false);
  const [showEditColorDialog, setShowEditColorDialog] = useState(false);
  const [showEditMachineDialog, setShowEditMachineDialog] = useState(false);
  const [showEditFilamentDialog, setShowEditFilamentDialog] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newMachineName, setNewMachineName] = useState('');
  const [newFilamentName, setNewFilamentName] = useState('');
  const [editColorName, setEditColorName] = useState('');
  const [editMachineName, setEditMachineName] = useState('');
  const [editFilamentName, setEditFilamentName] = useState('');
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [editingMachineIndex, setEditingMachineIndex] = useState<number | null>(null);
  const [editingFilamentIndex, setEditingFilamentIndex] = useState<number | null>(null);

  const presetManager = usePresetManager();

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

  // Color preset functions
  const handleAddColor = () => {
    if (newColorName.trim()) {
      presetManager.addPreset('colors', newColorName.trim());
      setNewColorName('');
      setShowAddColorDialog(false);
    }
  };

  const handleEditColor = (index: number, currentValue: string) => {
    setEditingColorIndex(index);
    setEditColorName(currentValue);
    setShowEditColorDialog(true);
  };

  const handleSaveColorEdit = () => {
    if (editingColorIndex !== null && editColorName.trim()) {
      presetManager.updatePreset('colors', editingColorIndex, editColorName.trim());
      setEditingColorIndex(null);
      setEditColorName('');
      setShowEditColorDialog(false);
    }
  };

  const handleDeleteColor = (index: number) => {
    presetManager.removePreset('colors', index);
  };

  // Machine preset functions
  const handleAddMachine = () => {
    if (newMachineName.trim()) {
      presetManager.addPreset('machineTypes', newMachineName.trim());
      setNewMachineName('');
      setShowAddMachineDialog(false);
    }
  };

  const handleEditMachine = (index: number, currentValue: string) => {
    setEditingMachineIndex(index);
    setEditMachineName(currentValue);
    setShowEditMachineDialog(true);
  };

  const handleSaveMachineEdit = () => {
    if (editingMachineIndex !== null && editMachineName.trim()) {
      presetManager.updatePreset('machineTypes', editingMachineIndex, editMachineName.trim());
      setEditingMachineIndex(null);
      setEditMachineName('');
      setShowEditMachineDialog(false);
    }
  };

  const handleDeleteMachine = (index: number) => {
    presetManager.removePreset('machineTypes', index);
  };

  // Filament preset functions
  const handleAddFilament = () => {
    if (newFilamentName.trim()) {
      presetManager.addPreset('filamentTypes', newFilamentName.trim());
      setNewFilamentName('');
      setShowAddFilamentDialog(false);
    }
  };

  const handleEditFilament = (index: number, currentValue: string) => {
    setEditingFilamentIndex(index);
    setEditFilamentName(currentValue);
    setShowEditFilamentDialog(true);
  };

  const handleSaveFilamentEdit = () => {
    if (editingFilamentIndex !== null && editFilamentName.trim()) {
      presetManager.updatePreset('filamentTypes', editingFilamentIndex, editFilamentName.trim());
      setEditingFilamentIndex(null);
      setEditFilamentName('');
      setShowEditFilamentDialog(false);
    }
  };

  const handleDeleteFilament = (index: number) => {
    presetManager.removePreset('filamentTypes', index);
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
                <SelectContent>
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
              <SelectContent>
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

        {/* Color, Machine Type, and Filament Type with Preset Management */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              <Select value={data.partColor} onValueChange={(value) => updateData('partColor', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {presetManager.presets.colors.map((color, index) => (
                    <SelectItem key={index} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Color Management Controls */}
              <div className="flex gap-1">
                <Dialog open={showAddColorDialog} onOpenChange={setShowAddColorDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Color</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Color Name</Label>
                        <Input
                          placeholder="Enter color name"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddColorDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddColor} disabled={!newColorName.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showEditColorDialog} onOpenChange={setShowEditColorDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 w-10 p-0"
                      onClick={() => {
                        const selectedIndex = presetManager.presets.colors.findIndex(color => color === data.partColor);
                        if (selectedIndex !== -1) {
                          handleEditColor(selectedIndex, data.partColor);
                        }
                      }}
                      disabled={!data.partColor}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Color</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Color Name</Label>
                        <Input
                          placeholder="Enter color name"
                          value={editColorName}
                          onChange={(e) => setEditColorName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowEditColorDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveColorEdit} disabled={!editColorName.trim()}>
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
                  onClick={() => {
                    const selectedIndex = presetManager.presets.colors.findIndex(color => color === data.partColor);
                    if (selectedIndex !== -1) {
                      handleDeleteColor(selectedIndex);
                      updateData('partColor', '');
                    }
                  }}
                  disabled={!data.partColor || presetManager.presets.colors.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
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
                  {presetManager.presets.machineTypes.map((machine, index) => (
                    <SelectItem key={index} value={machine}>
                      {machine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Machine Management Controls */}
              <div className="flex gap-1">
                <Dialog open={showAddMachineDialog} onOpenChange={setShowAddMachineDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Machine</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Machine Name</Label>
                        <Input
                          placeholder="Enter machine name"
                          value={newMachineName}
                          onChange={(e) => setNewMachineName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddMachineDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddMachine} disabled={!newMachineName.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showEditMachineDialog} onOpenChange={setShowEditMachineDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 w-10 p-0"
                      onClick={() => {
                        const selectedIndex = presetManager.presets.machineTypes.findIndex(machine => machine === data.machineType);
                        if (selectedIndex !== -1) {
                          handleEditMachine(selectedIndex, data.machineType);
                        }
                      }}
                      disabled={!data.machineType}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Machine</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Machine Name</Label>
                        <Input
                          placeholder="Enter machine name"
                          value={editMachineName}
                          onChange={(e) => setEditMachineName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowEditMachineDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveMachineEdit} disabled={!editMachineName.trim()}>
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
                  onClick={() => {
                    const selectedIndex = presetManager.presets.machineTypes.findIndex(machine => machine === data.machineType);
                    if (selectedIndex !== -1) {
                      handleDeleteMachine(selectedIndex);
                      updateData('machineType', '');
                    }
                  }}
                  disabled={!data.machineType || presetManager.presets.machineTypes.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Filament Type</Label>
            <div className="flex gap-2">
              <Select value={data.filamentType} onValueChange={(value) => updateData('filamentType', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select filament" />
                </SelectTrigger>
                <SelectContent>
                  {presetManager.presets.filamentTypes.map((filament, index) => (
                    <SelectItem key={index} value={filament}>
                      {filament}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Filament Management Controls */}
              <div className="flex gap-1">
                <Dialog open={showAddFilamentDialog} onOpenChange={setShowAddFilamentDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Filament</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Filament Name</Label>
                        <Input
                          placeholder="Enter filament name"
                          value={newFilamentName}
                          onChange={(e) => setNewFilamentName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddFilamentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddFilament} disabled={!newFilamentName.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showEditFilamentDialog} onOpenChange={setShowEditFilamentDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 w-10 p-0"
                      onClick={() => {
                        const selectedIndex = presetManager.presets.filamentTypes.findIndex(filament => filament === data.filamentType);
                        if (selectedIndex !== -1) {
                          handleEditFilament(selectedIndex, data.filamentType);
                        }
                      }}
                      disabled={!data.filamentType}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Filament</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Filament Name</Label>
                        <Input
                          placeholder="Enter filament name"
                          value={editFilamentName}
                          onChange={(e) => setEditFilamentName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowEditFilamentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveFilamentEdit} disabled={!editFilamentName.trim()}>
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
                  onClick={() => {
                    const selectedIndex = presetManager.presets.filamentTypes.findIndex(filament => filament === data.filamentType);
                    if (selectedIndex !== -1) {
                      handleDeleteFilament(selectedIndex);
                      updateData('filamentType', '');
                    }
                  }}
                  disabled={!data.filamentType || presetManager.presets.filamentTypes.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
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

        {/* Nozzle Diameter */}
        <div className="grid grid-cols-1 gap-4">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManagementSection;
