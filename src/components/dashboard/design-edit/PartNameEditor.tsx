
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
  };
  cadSoftware?: string;
  slicer?: string;
}

interface PartNameEditorProps {
  designParts: DesignPart[];
  activePart: string;
  isEditing: boolean;
  editPartName: string;
  onPartChange: (partId: string) => void;
  onEditPartNameChange: (name: string) => void;
  onSavePartName: () => void;
  validatePartFiles: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
}

const PartNameEditor: React.FC<PartNameEditorProps> = ({
  designParts,
  activePart,
  isEditing,
  editPartName,
  onPartChange,
  onEditPartNameChange,
  onSavePartName,
  validatePartFiles
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSavePartName();
    }
  };

  return (
    <div className="col-span-3 pr-1">
      <Label>Select Part</Label>
      {isEditing ? (
        <Input
          value={editPartName}
          onChange={(e) => onEditPartNameChange(e.target.value)}
          placeholder="Enter part name"
          className="h-10"
          onKeyPress={handleKeyPress}
        />
      ) : (
        <Select value={activePart} onValueChange={onPartChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select part" />
          </SelectTrigger>
          <SelectContent>
            {designParts.map((part) => {
              if (!part.id || part.id.trim() === '') {
                return null;
              }
              
              const partValidation = validatePartFiles(part);
              const needsValidation = partValidation.hasPersonalizedFiles && (!partValidation.hasF3D || !partValidation.hasINI);
              
              return (
                <SelectItem key={part.id} value={part.id}>
                  <div className="flex items-center gap-2">
                    {part.name}
                    {needsValidation && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default PartNameEditor;
