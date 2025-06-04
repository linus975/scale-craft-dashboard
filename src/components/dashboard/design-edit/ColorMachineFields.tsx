
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColorMachineFieldsProps {
  colorValue?: string;
  machineValue?: string;
  formControl?: any;
  machines?: any[];
  onColorChange?: (value: string) => void;
  onMachineChange?: (value: string) => void;
}

const ColorMachineFields: React.FC<ColorMachineFieldsProps> = ({
  colorValue = '',
  machineValue = '',
  formControl,
  machines = [],
  onColorChange,
  onMachineChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Farbe (optional)</label>
        <Input
          placeholder="Farbe eingeben"
          value={colorValue}
          onChange={(e) => onColorChange?.(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Maschine (optional)</label>
        <Input
          placeholder="Maschine eingeben"
          value={machineValue}
          onChange={(e) => onMachineChange?.(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ColorMachineFields;
