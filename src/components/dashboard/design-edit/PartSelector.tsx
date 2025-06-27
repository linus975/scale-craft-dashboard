
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DesignPart {
  id: string;
  name: string;
  partType?: 'static' | 'personalizable';
}

interface PartSelectorProps {
  designParts: DesignPart[];
  selectedPart: string;
  onPartChange: (partId: string) => void;
}

const PartSelector: React.FC<PartSelectorProps> = ({
  designParts,
  selectedPart,
  onPartChange
}) => {
  return (
    <div className="space-y-2">
      <Label>Select Part</Label>
      <Select value={selectedPart} onValueChange={onPartChange}>
        <SelectTrigger>
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
    </div>
  );
};

export default PartSelector;
