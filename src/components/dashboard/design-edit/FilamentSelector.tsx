
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilamentSelectorProps {
  id: string;
  label?: string;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

const FilamentSelector: React.FC<FilamentSelectorProps> = ({
  id,
  label = "Filament Type",
  required = false,
  className = "h-8 text-xs",
  onChange
}) => {
  const filamentTypes = [
    { value: "PLA", label: "PLA" },
    { value: "ABS", label: "ABS" },
    { value: "PETG", label: "PETG" },
    { value: "TPU", label: "TPU" },
    { value: "WOOD", label: "Wood Fill" },
    { value: "METAL", label: "Metal Fill" },
    { value: "CARBON", label: "Carbon Fiber" },
    { value: "NYLON", label: "Nylon" },
    { value: "PC", label: "Polycarbonate" },
    { value: "ASA", label: "ASA" }
  ];

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select onValueChange={onChange}>
        <SelectTrigger className={className} id={id}>
          <SelectValue placeholder="Select filament type" />
        </SelectTrigger>
        <SelectContent>
          {filamentTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilamentSelector;
