
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
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
  colorValue,
  machineValue,
  formControl,
  machines = [],
  onColorChange,
  onMachineChange
}) => {
  if (colorValue === undefined && machineValue === undefined) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {colorValue !== undefined && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Farbe (optional)</label>
          <Input
            placeholder="Farbe eingeben"
            value={colorValue}
            onChange={(e) => onColorChange?.(e.target.value)}
          />
        </div>
      )}

      {machineValue !== undefined && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Maschine (optional)</label>
          <Select value={machineValue} onValueChange={onMachineChange}>
            <SelectTrigger>
              <SelectValue placeholder="Maschine auswählen" />
            </SelectTrigger>
            <SelectContent>
              {machines.map((machine) => (
                <SelectItem key={machine.id} value={machine.name}>
                  {machine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ColorMachineFields;
