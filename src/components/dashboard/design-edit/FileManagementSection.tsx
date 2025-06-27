
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MultiPartFileManager from './MultiPartFileManager';
import PresetSelector from './PresetSelector';
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
  files: any[];
  partType?: 'static' | 'customisable';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
  nozzleDiameter?: string;
  filamentType?: string;
  color?: string;
  machine?: string;
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
  onPartTypeChange: (partId: string, partType: 'static' | 'customisable') => void;
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
  const presetManager = usePresetManager();

  const handleFieldChange = (field: keyof FileManagementData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Handler for when a new color is added via PresetSelector
  const handleAddColor = () => {
    presetManager.openAddDialog('colors');
  };

  const handleSaveNewColor = () => {
    if (presetManager.newPresetValue.trim()) {
      presetManager.addPreset('colors', presetManager.newPresetValue);
      // Automatically select the newly added color
      handleFieldChange('partColor', presetManager.newPresetValue.trim());
      presetManager.closeAddDialog();
    }
  };

  // Handler for when a new machine type is added via PresetSelector
  const handleAddMachineType = () => {
    presetManager.openAddDialog('machineTypes');
  };

  const handleSaveNewMachineType = () => {
    if (presetManager.newPresetValue.trim()) {
      presetManager.addPreset('machineTypes', presetManager.newPresetValue);
      // Automatically select the newly added machine type
      handleFieldChange('machineType', presetManager.newPresetValue.trim());
      presetManager.closeAddDialog();
    }
  };

  // Handler for when a new filament type is added via PresetSelector
  const handleAddFilamentType = () => {
    presetManager.openAddDialog('filamentTypes');
  };

  const handleSaveNewFilamentType = () => {
    if (presetManager.newPresetValue.trim()) {
      presetManager.addPreset('filamentTypes', presetManager.newPresetValue);
      // Automatically select the newly added filament type
      handleFieldChange('filamentType', presetManager.newPresetValue.trim());
      presetManager.closeAddDialog();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Multi-Part File Manager */}
        <MultiPartFileManager
          uploadedFiles={[]}
          loadingFiles={false}
          uploading={false}
          onFileUpload={() => {}}
          onFileRemove={() => {}}
          onFileDownload={() => {}}
          designParts={designParts}
          activePart={activePart}
          onPartChange={onPartChange}
          onAddPart={onAddPart}
          onRemovePart={onRemovePart}
          onRenamePart={onRenamePart}
          onPartTypeChange={onPartTypeChange}
        />

        <Separator />

        {/* Part Configuration Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Part Configuration</h3>
          
          {/* Row 1: CAD Software and Slicer Software */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CAD Software</Label>
              <Select 
                value={data.cadSoftware} 
                onValueChange={(value) => handleFieldChange('cadSoftware', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select CAD Software" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="fusion360">Fusion 360</SelectItem>
                  <SelectItem value="solidworks">SolidWorks</SelectItem>
                  <SelectItem value="autocad">AutoCAD</SelectItem>
                  <SelectItem value="inventor">Inventor</SelectItem>
                  <SelectItem value="catia">CATIA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Slicer Software</Label>
              <Select 
                value={data.slicerSoftware} 
                onValueChange={(value) => handleFieldChange('slicerSoftware', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Slicer" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="prusaslicer">PrusaSlicer</SelectItem>
                  <SelectItem value="cura">Ultimaker Cura</SelectItem>
                  <SelectItem value="bambu">Bambu Studio</SelectItem>
                  <SelectItem value="superslicer">SuperSlicer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Color and Machine Type */}
          <div className="grid grid-cols-2 gap-4">
            <PresetSelector
              label="Color"
              value={data.partColor}
              onChange={(value) => handleFieldChange('partColor', value)}
              presets={presetManager.presets.colors}
              onAddPreset={handleAddColor}
              onEditPreset={(index, currentValue) => presetManager.startEditing('colors', index, currentValue)}
              onRemovePreset={(index) => presetManager.removePreset('colors', index)}
              showAddDialog={presetManager.showAddDialog.type === 'colors' && presetManager.showAddDialog.isOpen}
              onCloseAddDialog={presetManager.closeAddDialog}
              newPresetValue={presetManager.newPresetValue}
              onNewPresetValueChange={presetManager.setNewPresetValue}
              onSaveNewPreset={handleSaveNewColor}
              editingPreset={presetManager.editingPreset?.type === 'colors' ? presetManager.editingPreset : null}
              onEditValueChange={(value) => presetManager.setEditingPreset(prev => prev ? { ...prev, value } : null)}
              onSaveEdit={presetManager.saveEdit}
              onCancelEdit={presetManager.cancelEdit}
              placeholder="Select color"
            />

            <PresetSelector
              label="Machine Type"
              value={data.machineType}
              onChange={(value) => handleFieldChange('machineType', value)}
              presets={presetManager.presets.machineTypes}
              onAddPreset={handleAddMachineType}
              onEditPreset={(index, currentValue) => presetManager.startEditing('machineTypes', index, currentValue)}
              onRemovePreset={(index) => presetManager.removePreset('machineTypes', index)}
              showAddDialog={presetManager.showAddDialog.type === 'machineTypes' && presetManager.showAddDialog.isOpen}
              onCloseAddDialog={presetManager.closeAddDialog}
              newPresetValue={presetManager.newPresetValue}
              onNewPresetValueChange={presetManager.setNewPresetValue}
              onSaveNewPreset={handleSaveNewMachineType}
              editingPreset={presetManager.editingPreset?.type === 'machineTypes' ? presetManager.editingPreset : null}
              onEditValueChange={(value) => presetManager.setEditingPreset(prev => prev ? { ...prev, value } : null)}
              onSaveEdit={presetManager.saveEdit}
              onCancelEdit={presetManager.cancelEdit}
              placeholder="Select machine type"
            />
          </div>

          {/* Row 3: Nozzle Diameter and Filament Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nozzle Diameter</Label>
              <Input
                placeholder="e.g., 0.4mm"
                value={data.nozzleDiameter}
                onChange={(e) => handleFieldChange('nozzleDiameter', e.target.value)}
              />
            </div>

            <PresetSelector
              label="Filament Type"
              value={data.filamentType}
              onChange={(value) => handleFieldChange('filamentType', value)}
              presets={presetManager.presets.filamentTypes}
              onAddPreset={handleAddFilamentType}
              onEditPreset={(index, currentValue) => presetManager.startEditing('filamentTypes', index, currentValue)}
              onRemovePreset={(index) => presetManager.removePreset('filamentTypes', index)}
              showAddDialog={presetManager.showAddDialog.type === 'filamentTypes' && presetManager.showAddDialog.isOpen}
              onCloseAddDialog={presetManager.closeAddDialog}
              newPresetValue={presetManager.newPresetValue}
              onNewPresetValueChange={presetManager.setNewPresetValue}
              onSaveNewPreset={handleSaveNewFilamentType}
              editingPreset={presetManager.editingPreset?.type === 'filamentTypes' ? presetManager.editingPreset : null}
              onEditValueChange={(value) => presetManager.setEditingPreset(prev => prev ? { ...prev, value } : null)}
              onSaveEdit={presetManager.saveEdit}
              onCancelEdit={presetManager.cancelEdit}
              placeholder="Select filament type"
            />
          </div>

          {/* Personalization Parameters - only show for customisable parts */}
          {data.partType === 'customisable' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-md font-medium">Personalization Parameters</h4>
                  <Badge variant="secondary">Customisable Part</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sketch Name</Label>
                    <Input
                      placeholder="Name of the sketch to modify"
                      value={data.sketchName}
                      onChange={(e) => handleFieldChange('sketchName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Replacement Type</Label>
                    <Select 
                      value={data.replacementType} 
                      onValueChange={(value) => handleFieldChange('replacementType', value as 'text' | 'dimension')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select replacement type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="dimension">Dimension</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManagementSection;
