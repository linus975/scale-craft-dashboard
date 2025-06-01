
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilamentSelectorProps {
  id: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const FilamentSelector: React.FC<FilamentSelectorProps> = ({
  id,
  label = "Filament Type",
  required = false,
  className = "h-8 text-xs"
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select required={required}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select filament" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pla">PLA</SelectItem>
          <SelectItem value="abs">ABS</SelectItem>
          <SelectItem value="petg">PETG</SelectItem>
          <SelectItem value="tpu">TPU</SelectItem>
          <SelectItem value="wood">Wood</SelectItem>
          <SelectItem value="metal">Metal Fill</SelectItem>
          <SelectItem value="carbon">Carbon Fiber</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilamentSelector;
