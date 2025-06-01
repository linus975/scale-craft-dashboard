
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NozzleDiameterInputProps {
  id: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const NozzleDiameterInput: React.FC<NozzleDiameterInputProps> = ({
  id,
  label = "Nozzle Diameter (mm)",
  required = false,
  className = "h-8 text-xs"
}) => {
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
      />
    </div>
  );
};

export default NozzleDiameterInput;
