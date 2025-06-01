
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import PartSelector from './PartSelector';
import FileUpload from './FileUpload';
import FileList from './FileList';
import ParameterConfig from './ParameterConfig';
import ValidationInfo from './ValidationInfo';
import { useMultiPartManager } from '@/hooks/useMultiPartManager';
import { organizeFilesByParts, validatePartFiles } from '@/utils/fileOrganization';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
  designType?: 'static' | 'personalized';
}

interface DesignPart {
  id: string;
  name: string;
  files: UploadedFile[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
}

interface MultiPartFileManagerProps {
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string) => void;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
  onPartParametersChange?: (partId: string, parameters: { sketchName: string; replacementValue: string }) => void;
  selectedPartId?: string;
  onPartSelect?: (partId: string) => void;
  designParts?: DesignPart[];
  activePart?: string;
  onPartChange?: (partId: string) => void;
  onAddPart?: (name: string) => void;
  onRemovePart?: (partId: string) => void;
  onRenamePart?: (partId: string, newName: string) => void;
  onPartTypeChange?: (partId: string, partType: 'static' | 'personalized') => void;
  onPartSoftwareChange?: (partId: string, field: 'cadSoftware' | 'slicer', value: string) => void;
  validatePartFiles?: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
  // New props for Color and Machine fields
  colorValue?: string;
  machineValue?: string;
  onColorChange?: (value: string) => void;
  onMachineChange?: (value: string) => void;
  machines?: Array<{ id: string; name: string }>;
  formControl?: any;
}

const MultiPartFileManager: React.FC<MultiPartFileManagerProps> = ({
  uploadedFiles,
  loadingFiles,
  uploading,
  onFileUpload,
  onFileRemove,
  onFileDownload,
  onPartParametersChange,
  selectedPartId,
  onPartSelect,
  designParts: externalDesignParts,
  activePart: externalActivePart,
  onPartChange: externalOnPartChange,
  onAddPart: externalOnAddPart,
  onRemovePart: externalOnRemovePart,
  onRenamePart: externalOnRenamePart,
  onPartTypeChange: externalOnPartTypeChange,
  onPartSoftwareChange: externalOnPartSoftwareChange,
  validatePartFiles: externalValidatePartFiles,
  colorValue,
  machineValue,
  onColorChange,
  onMachineChange,
  machines = [],
  formControl,
}) => {
  const {
    designParts,
    activePart,
    addNewPart,
    removePart,
    renamePart,
    handlePartTypeChange,
    handlePartSoftwareChange,
    handlePartParametersChange,
    handlePartChange
  } = useMultiPartManager({
    externalDesignParts,
    externalActivePart,
    selectedPartId,
    onPartSelect
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event, activePart);
  };

  const handleFileTypeChange = (fileId: string, designType: 'static' | 'personalized') => {
    console.log(`Changing file ${fileId} to ${designType}`);
  };

  const organizedParts = organizeFilesByParts(designParts, uploadedFiles);
  const currentPart = organizedParts.find(part => part.id === activePart) || organizedParts[0];
  
  const validation = currentPart ? 
    (externalValidatePartFiles ? externalValidatePartFiles(currentPart) : validatePartFiles(currentPart)) : 
    { hasF3D: false, hasINI: false, hasPersonalizedFiles: false };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <PartSelector
        designParts={designParts}
        activePart={activePart}
        onPartChange={(value) => handlePartChange(value, externalOnPartChange)}
        onAddPart={(name) => addNewPart(name, externalOnAddPart)}
        onRemovePart={(partId) => removePart(partId, externalOnRemovePart)}
        onRenamePart={(partId, newName) => renamePart(partId, newName, externalOnRenamePart)}
        onPartTypeChange={(partId, partType) => handlePartTypeChange(partId, partType, externalOnPartTypeChange)}
        onPartSoftwareChange={(partId, field, value) => handlePartSoftwareChange(partId, field, value, externalOnPartSoftwareChange)}
        validatePartFiles={externalValidatePartFiles || validatePartFiles}
      />

      {/* Required Fields Section */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="space-y-3">
          <h4 className="font-medium text-blue-900">CAD Software *</h4>
          <Select required>
            <SelectTrigger>
              <SelectValue placeholder="Select CAD software" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fusion360">Fusion 360</SelectItem>
              <SelectItem value="solidworks">SolidWorks</SelectItem>
              <SelectItem value="autocad">AutoCAD</SelectItem>
              <SelectItem value="inventor">Inventor</SelectItem>
              <SelectItem value="creo">Creo</SelectItem>
              <SelectItem value="catia">CATIA</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-blue-900">Slicer Software *</h4>
          <Select required>
            <SelectTrigger>
              <SelectValue placeholder="Select slicer software" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prusa">PrusaSlicer</SelectItem>
              <SelectItem value="cura">Ultimaker Cura</SelectItem>
              <SelectItem value="superslicer">SuperSlicer</SelectItem>
              <SelectItem value="bambu">Bambu Studio</SelectItem>
              <SelectItem value="simplify3d">Simplify3D</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color and Machine fields */}
      {(colorValue !== undefined || machineValue !== undefined) && (
        <div className="grid grid-cols-2 gap-4">
          {colorValue !== undefined && formControl && (
            <FormField
              control={formControl}
              name="color"
              rules={{ required: "Color is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {machineValue !== undefined && formControl && (
            <FormField
              control={formControl}
              name="machine"
              rules={{ required: "Machine is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter machine name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {currentPart && (
        <>
          <ValidationInfo
            partName={currentPart.name}
            hasPersonalizedFiles={validation.hasPersonalizedFiles}
            hasF3D={validation.hasF3D}
            hasINI={validation.hasINI}
          />

          <FileUpload
            partName={currentPart.name}
            partId={currentPart.id}
            partType={currentPart.partType}
            uploading={uploading}
            onFileUpload={handleFileUpload}
            uploadedFiles={uploadedFiles}
          />

          <ParameterConfig
            currentPart={currentPart}
            hasPersonalizedFiles={validation.hasPersonalizedFiles}
            onPartParametersChange={(partId, field, value) => 
              handlePartParametersChange(partId, field, value, onPartParametersChange)
            }
          />

          {(loadingFiles || currentPart.files.length > 0) && (
            <FileList
              files={currentPart.files}
              partName={currentPart.name}
              loadingFiles={loadingFiles}
              onFileRemove={onFileRemove}
              onFileDownload={onFileDownload}
              onFileTypeChange={handleFileTypeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MultiPartFileManager;
