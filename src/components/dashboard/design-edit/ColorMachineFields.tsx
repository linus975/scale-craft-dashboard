
import React from 'react';
import { Input } from '@/components/ui/input';

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
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onColorChange?.(value);
  };

  const handleMachineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMachineChange?.(value);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Farbe (optional)</label>
        <Input
          placeholder="Farbe eingeben"
          value={colorValue}
          onChange={handleColorChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Maschine (optional)</label>
        <Input
          placeholder="Maschine eingeben"
          value={machineValue}
          onChange={handleMachineChange}
        />
      </div>
    </div>
  );
};

export default ColorMachineFields;
