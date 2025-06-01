
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, X, FileCode, Plus, AlertTriangle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
}

interface DesignPart {
  id: string;
  name: string;
  files: UploadedFile[];
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
  };
}

interface MultiPartFileManagerProps {
  uploadedFiles: UploadedFile[];
  loadingFiles: boolean;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string) => void;
  onFileRemove: (file: UploadedFile) => void;
  onFileDownload: (file: UploadedFile) => void;
  onPartParametersChange?: (partId: string, parameters: { sketchName: string; replacementValue: string }) => void;
  isPersonalized?: boolean;
  selectedPartId?: string;
  onPartSelect?: (partId: string) => void;
}

const MultiPartFileManager: React.FC<MultiPartFileManagerProps> = ({
  uploadedFiles,
  loadingFiles,
  uploading,
  onFileUpload,
  onFileRemove,
  onFileDownload,
  onPartParametersChange,
  isPersonalized = false,
  selectedPartId,
  onPartSelect,
}) => {
  const [designParts, setDesignParts] = useState<DesignPart[]>([
    { id: 'part1', name: 'Teil 1', files: [], parameters: { sketchName: '', replacementValue: '' } }
  ]);
  const [activePart, setActivePart] = useState(selectedPartId || 'part1');
  const [newPartName, setNewPartName] = useState('');

  // Organize files by parts
  const organizeFilesByParts = () => {
    const organizedParts = designParts.map(part => ({
      ...part,
      files: uploadedFiles.filter(file => file.partId === part.id || (!file.partId && part.id === 'part1'))
    }));
    return organizedParts;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onFileUpload(event, activePart);
  };

  const handleFileRemove = (file: UploadedFile) => {
    onFileRemove(file);
  };

  const addNewPart = () => {
    if (newPartName.trim()) {
      const newPart: DesignPart = {
        id: `part-${Date.now()}`,
        name: newPartName.trim(),
        files: [],
        parameters: { sketchName: '', replacementValue: '' }
      };
      setDesignParts(prev => [...prev, newPart]);
      setActivePart(newPart.id);
      setNewPartName('');
      
      if (onPartSelect) {
        onPartSelect(newPart.id);
      }
    }
  };

  const removePart = (partId: string) => {
    if (designParts.length <= 1) return; // Keep at least one part
    
    setDesignParts(prev => prev.filter(part => part.id !== partId));
    
    // Switch to first available part
    const remainingParts = designParts.filter(part => part.id !== partId);
    if (remainingParts.length > 0) {
      setActivePart(remainingParts[0].id);
      if (onPartSelect) {
        onPartSelect(remainingParts[0].id);
      }
    }
  };

  const handlePartParametersChange = (partId: string, field: string, value: string) => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId 
        ? { ...part, parameters: { ...part.parameters, [field]: value } }
        : part
    ));
    
    if (onPartParametersChange) {
      const part = designParts.find(p => p.id === partId);
      if (part?.parameters) {
        onPartParametersChange(partId, {
          sketchName: part.parameters.sketchName || '',
          replacementValue: part.parameters.replacementValue || ''
        });
      }
    }
  };

  const handlePartNameChange = (partId: string, newName: string) => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId ? { ...part, name: newName } : part
    ));
  };

  const handlePartChange = (value: string) => {
    setActivePart(value);
    if (onPartSelect) {
      onPartSelect(value);
    }
  };

  const organizedParts = organizeFilesByParts();
  const currentPart = organizedParts.find(part => part.id === activePart) || organizedParts[0];

  const validatePartFiles = (part: DesignPart) => {
    const hasF3D = part.files.some(f => f.name.toLowerCase().endsWith('.f3d'));
    const hasINI = part.files.some(f => f.name.toLowerCase().endsWith('.ini'));
    return { hasF3D, hasINI };
  };

  const validation = currentPart ? validatePartFiles(currentPart) : { hasF3D: false, hasINI: false };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      {/* Part Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label>Teil auswählen</Label>
            <Select value={activePart} onValueChange={handlePartChange}>
              <SelectTrigger>
                <SelectValue placeholder="Teil auswählen" />
              </SelectTrigger>
              <SelectContent>
                {designParts.map((part) => {
                  const partValidation = validatePartFiles(part);
                  const isValid = !isPersonalized || (partValidation.hasF3D && partValidation.hasINI);
                  
                  return (
                    <SelectItem key={part.id} value={part.id}>
                      <div className="flex items-center gap-2">
                        {part.name}
                        {!isValid && isPersonalized && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end gap-2">
            <div>
              <Label>Neuer Teil</Label>
              <Input
                placeholder="Teilname..."
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="w-32"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addNewPart();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addNewPart}
              disabled={!newPartName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Part Name Editor */}
        {currentPart && (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label>Teilname bearbeiten</Label>
              <Input
                value={currentPart.name}
                onChange={(e) => handlePartNameChange(currentPart.id, e.target.value)}
                placeholder="Teilname eingeben"
              />
            </div>
            {designParts.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removePart(currentPart.id)}
                className="mt-6"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {currentPart && (
        <>
          {/* File Requirements Info */}
          {isPersonalized && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Erforderliche Dateien für "{currentPart.name}":</h5>
              <div className="flex gap-4 text-sm">
                <div className={`flex items-center gap-1 ${validation.hasF3D ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.hasF3D ? '✓' : '✗'} F3D-Datei (CAD)
                </div>
                <div className={`flex items-center gap-1 ${validation.hasINI ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.hasINI ? '✓' : '✗'} INI-Datei (Einstellungen)
                </div>
              </div>
            </div>
          )}

          {/* Parameter Configuration for Personalized Designs */}
          {isPersonalized && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h5 className="font-medium">Parameter für "{currentPart.name}"</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sketch-Name</Label>
                  <Input
                    placeholder="Name des Sketches"
                    value={currentPart.parameters?.sketchName || ''}
                    onChange={(e) => handlePartParametersChange(currentPart.id, 'sketchName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ersetzungsparameter</Label>
                  <Input
                    placeholder="Parameter zum Ersetzen"
                    value={currentPart.parameters?.replacementValue || ''}
                    onChange={(e) => handlePartParametersChange(currentPart.id, 'replacementValue', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor={`fileUpload-${currentPart.id}`}>
              Dateien für "{currentPart.name}" hochladen
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {isPersonalized 
                  ? `F3D- und INI-Dateien für ${currentPart.name} hochladen` 
                  : `Dateien für ${currentPart.name} hochladen`
                }
              </p>
              <Input
                id={`fileUpload-${currentPart.id}`}
                type="file"
                multiple
                accept={isPersonalized ? '.f3d,.ini,.step,.stl,.gcode' : undefined}
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(`fileUpload-${currentPart.id}`)?.click();
                }}
                disabled={uploading}
              >
                {uploading ? 'Hochladen...' : 'Dateien auswählen'}
              </Button>
            </div>
          </div>

          {/* Files for current part */}
          {(loadingFiles || currentPart.files.length > 0) && (
            <div className="space-y-2">
              <Label>Dateien für "{currentPart.name}"</Label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                {loadingFiles ? (
                  <p className="text-sm text-gray-500">Dateien werden geladen...</p>
                ) : currentPart.files.length === 0 ? (
                  <p className="text-sm text-gray-500">Keine Dateien für diesen Teil</p>
                ) : (
                  currentPart.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {file.type.includes('G-Code') ? 
                          <FileCode className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                          <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        }
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.type} • {file.size} • {file.uploadDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileDownload(file);
                          }}
                          className="h-8 px-2"
                        >
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileRemove(file);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Datei löschen"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultiPartFileManager;
