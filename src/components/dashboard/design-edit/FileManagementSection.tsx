import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import { usePresetManager } from '@/hooks/usePresetManager';
import PartManagementControls from './PartManagementControls';
import PresetManagementControls from './PresetManagementControls';
import FileUploadArea from './FileUploadArea';
import PersonalizationFields from './PersonalizationFields';
import type { DesignPart } from '@/types/designPart';

interface FileManagementData {
  selectedPart: string;
  partType: 'static' | 'personalizable';
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
  designParts: DesignPart[];
  activePart: string;
  onPartChange: (partId: string) => void;
  onAddPart: (name: string) => void;
  onRemovePart: (partId: string) => void;
  onRenamePart: (partId: string, newName: string) => void;
  onPartTypeChange: (partId: string, partType: 'static' | 'personalizable') => void;
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

  const presetManager = usePresetManager();

  const updateData = (field: keyof FileManagementData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Get current part data
  const currentPart = designParts.find(part => part.id === activePart);

  // Update data when part changes - use part-specific values
  useEffect(() => {
    if (currentPart) {
      onChange({
        ...data,
        selectedPart: currentPart.id,
        partType: currentPart.partType || 'static',
        cadSoftware: currentPart.cadSoftware || '',
        slicerSoftware: currentPart.slicer || '',
        partColor: currentPart.color || '',
        machineType: currentPart.machine || '',
        nozzleDiameter: currentPart.nozzleDiameter || '',
        filamentType: currentPart.filamentType || '',
        sketchName: currentPart.parameters?.sketchName || '',
        replacementType: (currentPart.parameters?.replacementType as 'text' | 'dimension') || 'text'
      });
    }
  }, [activePart, currentPart]);

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

  const handlePartTypeChange = (value: 'static' | 'personalizable') => {
    updateData('partType', value);
    onPartTypeChange(activePart, value);
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
              
              <PartManagementControls
                onAddPart={onAddPart}
                onEditPart={onRenamePart}
                onRemovePart={onRemovePart}
                currentPart={currentPart ? { id: currentPart.id, name: currentPart.name } : null}
                canRemove={designParts.length > 1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Part Type</Label>
            <Select value={currentPart?.partType || 'static'} onValueChange={handlePartTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select part type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="personalizable">Personalizable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional Row: CAD and Slicer Software (only for personalizable) */}
        {(currentPart?.partType === 'personalizable') && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CAD Software</Label>
              <Select value={currentPart?.cadSoftware || ''} onValueChange={(value) => updateData('cadSoftware', value)}>
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
              <Select value={currentPart?.slicer || ''} onValueChange={(value) => updateData('slicerSoftware', value)}>
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

        {/* Color and Machine Type Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              <Select value={currentPart?.color || ''} onValueChange={(value) => updateData('partColor', value)}>
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
              
              <PresetManagementControls
                presetType="color"
                presets={presetManager.presets.colors}
                currentValue={data.partColor}
                onAddPreset={(value) => presetManager.addPreset('colors', value)}
                onEditPreset={(index, value) => presetManager.updatePreset('colors', index, value)}
                onDeletePreset={(index) => presetManager.removePreset('colors', index)}
                onValueChange={(value) => updateData('partColor', value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Machine Type</Label>
            <div className="flex gap-2">
              <Select value={currentPart?.machine || ''} onValueChange={(value) => updateData('machineType', value)}>
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
              
              <PresetManagementControls
                presetType="machine"
                presets={presetManager.presets.machineTypes}
                currentValue={data.machineType}
                onAddPreset={(value) => presetManager.addPreset('machineTypes', value)}
                onEditPreset={(index, value) => presetManager.updatePreset('machineTypes', index, value)}
                onDeletePreset={(index) => presetManager.removePreset('machineTypes', index)}
                onValueChange={(value) => updateData('machineType', value)}
              />
            </div>
          </div>
        </div>

        {/* File Upload Row */}
        <FileUploadArea
          partType={data.partType}
          onGcodeUpload={handleGcodeUpload}
          onCadUpload={handleCadUpload}
          onIniUpload={handleIniUpload}
          gcodeFile={gcodeFile}
          cadFile={cadFile}
          iniFile={iniFile}
        />

        {/* Sketch Name and Replacement Type (only for personalizable) */}
        {data.partType === 'personalizable' && (
          <PersonalizationFields
            sketchName={data.sketchName}
            replacementType={data.replacementType}
            onSketchNameChange={(value) => updateData('sketchName', value)}
            onReplacementTypeChange={(value) => updateData('replacementType', value)}
          />
        )}

        {/* Nozzle Diameter and Filament Type Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nozzle Diameter (mm)</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="2.0"
              placeholder="0.4"
              value={currentPart?.nozzleDiameter || ''}
              onChange={(e) => updateData('nozzleDiameter', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Filament Type</Label>
            <div className="flex gap-2">
              <Select value={currentPart?.filamentType || ''} onValueChange={(value) => updateData('filamentType', value)}>
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
              
              <PresetManagementControls
                presetType="filament"
                presets={presetManager.presets.filamentTypes}
                currentValue={data.filamentType}
                onAddPreset={(value) => presetManager.addPreset('filamentTypes', value)}
                onEditPreset={(index, value) => presetManager.updatePreset('filamentTypes', index, value)}
                onDeletePreset={(index) => presetManager.removePreset('filamentTypes', index)}
                onValueChange={(value) => updateData('filamentType', value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManagementSection;
