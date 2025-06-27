
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalizationFieldsProps {
  sketchName: string;
  replacementType: 'text' | 'dimension';
  onSketchNameChange: (value: string) => void;
  onReplacementTypeChange: (value: 'text' | 'dimension') => void;
}

const PersonalizationFields: React.FC<PersonalizationFieldsProps> = ({
  sketchName,
  replacementType,
  onSketchNameChange,
  onReplacementTypeChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Sketch Name</Label>
        <Input
          placeholder="Enter sketch name"
          value={sketchName}
          onChange={(e) => onSketchNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Replacement Type</Label>
        <Select value={replacementType} onValueChange={onReplacementTypeChange}>
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
  );
};

export default PersonalizationFields;
