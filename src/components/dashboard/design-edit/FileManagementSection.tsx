
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings2, Upload, X, FileText, Code, Settings } from 'lucide-react';
import { usePresetManager } from '@/hooks/usePresetManager';
import { useFileSelection, SelectedFile } from '@/hooks/useFileSelection';
import PartManagementControls from './PartManagementControls';
import PresetManagementControls from './PresetManagementControls';
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
  const presetManager = usePresetManager();
  const { selectedFiles, addFiles, removeFile, getFilesForPart } = useFileSelection();

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

  const handlePartTypeChange = (value: 'static' | 'personalizable') => {
    updateData('partType', value);
    onPartTypeChange(activePart, value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'gcode' | 'cad' | 'ini') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Only allow one file per type
    const file = files[0];
    addFiles([file], activePart, currentPart?.partType);
    
    // Reset input
    event.target.value = '';
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'CAD': return <FileText className="h-4 w-4" />;
      case 'INI': return <Settings className="h-4 w-4" />;
      case 'GCODE': return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const partFiles = getFilesForPart(activePart);
  const gcodeFile = partFiles.find(f => f.fileCategory === 'GCODE');
  const cadFile = partFiles.find(f => f.fileCategory === 'CAD');
  const iniFile = partFiles.find(f => f.fileCategory === 'INI');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          File Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Select Part (left) and Part Type (right) */}
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

        {/* Row 2: CAD Software (left) and Slicer Software (right) - only for personalizable */}
        {currentPart?.partType === 'personalizable' && (
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

        {/* Row 3: Color (left) and Machine Type (right) */}
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

        {/* Row 4: File Upload - Static: G-Code (full width), Personalizable: CAD (left) + INI (right) */}
        {currentPart?.partType === 'static' ? (
          /* Static: G-Code Upload (full width) */
          <div className="space-y-2">
            <Label>G-Code Datei</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                {gcodeFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                      <Code className="h-4 w-4" />
                      <span className="text-sm font-medium">{gcodeFile.file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(gcodeFile.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Label htmlFor={`gcode-upload-${activePart}`} className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        G-Code Datei auswählen
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        .gcode, .g Dateien
                      </p>
                    </Label>
                    <Input
                      id={`gcode-upload-${activePart}`}
                      type="file"
                      accept=".gcode,.g"
                      onChange={(e) => handleFileUpload(e, 'gcode')}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Personalizable: CAD (left) + INI (right) */
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CAD File (.f3d)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  {cadFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1 p-2 bg-gray-50 rounded border">
                        <FileText className="h-3 w-3" />
                        <span className="text-xs font-medium truncate">{cadFile.file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(cadFile.id)}
                          className="h-4 w-4 p-0 text-red-500 hover:text-red-700 ml-1"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Label htmlFor={`cad-upload-${activePart}`} className="cursor-pointer">
                        <span className="text-xs font-medium text-blue-600 hover:text-blue-500">
                          F3D auswählen
                        </span>
                      </Label>
                      <Input
                        id={`cad-upload-${activePart}`}
                        type="file"
                        accept=".f3d"
                        onChange={(e) => handleFileUpload(e, 'cad')}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>INI File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  {iniFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1 p-2 bg-gray-50 rounded border">
                        <Settings className="h-3 w-3" />
                        <span className="text-xs font-medium truncate">{iniFile.file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(iniFile.id)}
                          className="h-4 w-4 p-0 text-red-500 hover:text-red-700 ml-1"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Label htmlFor={`ini-upload-${activePart}`} className="cursor-pointer">
                        <span className="text-xs font-medium text-blue-600 hover:text-blue-500">
                          INI auswählen
                        </span>
                      </Label>
                      <Input
                        id={`ini-upload-${activePart}`}
                        type="file"
                        accept=".ini"
                        onChange={(e) => handleFileUpload(e, 'ini')}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Row 5: Sketch Name (left) and Replacement Type (right) - only for personalizable */}
        {currentPart?.partType === 'personalizable' && (
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

        {/* Row 6: Nozzle Diameter (left) and Filament Type (right) */}
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
