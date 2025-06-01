
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NozzleDiameterInputProps {
  id: string;
  label?: string;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

const NozzleDiameterInput: React.FC<NozzleDiameterInputProps> = ({
  id,
  label = "Nozzle Diameter (mm)",
  required = false,
  className = "h-8 text-xs",
  onChange
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        placeholder="0.4"
        type="number"
        step="0.1"
        min="0.1"
        max="2.0"
        className={className}
        required={required}
        onChange={handleChange}
      />
    </div>
  );
};

export default NozzleDiameterInput;
