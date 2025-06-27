
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PartTypeSelectorProps {
  partType: 'static' | 'customisable';
  onPartTypeChange: (partType: 'static' | 'customisable') => void;
  disabled?: boolean;
}

const PartTypeSelector: React.FC<PartTypeSelectorProps> = ({
  partType,
  onPartTypeChange,
  disabled = false
}) => {
  return (
    <div className="col-span-6">
      <Label>Part Type</Label>
      <Select 
        value={partType || 'static'} 
        onValueChange={(value) => onPartTypeChange(value as 'static' | 'customisable')}
        disabled={disabled}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Select part type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="static">Static</SelectItem>
          <SelectItem value="customisable">Personalizable</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PartTypeSelector;
