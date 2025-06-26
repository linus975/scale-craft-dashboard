
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColorMachineFieldsProps {
  partId: string;
  designParts?: Array<{
    id: string;
    name: string;
    color?: string;
    machine?: string;
    nozzleDiameter?: string;
    filamentType?: string;
  }>;
  machines?: Array<{ id: string; name: string }>;
  onPartSpecificationChange?: (partId: string, field: 'nozzleDiameter' | 'filamentType' | 'color' | 'machine', value: string) => void;
}

const ColorMachineFields: React.FC<ColorMachineFieldsProps> = ({
  partId,
  designParts = [],
  machines = [],
  onPartSpecificationChange
}) => {
  const currentPart = designParts.find(part => part.id === partId);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPartSpecificationChange?.(partId, 'color', value);
  };

  const handleMachineChange = (value: string) => {
    onPartSpecificationChange?.(partId, 'machine', value);
  };

  const handleNozzleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPartSpecificationChange?.(partId, 'nozzleDiameter', value);
  };

  const handleFilamentChange = (value: string) => {
    onPartSpecificationChange?.(partId, 'filamentType', value);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Farbe</label>
        <Input
          placeholder="Farbe eingeben"
          value={currentPart?.color || ''}
          onChange={handleColorChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Maschine</label>
        <Select onValueChange={handleMachineChange} value={currentPart?.machine || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Maschine wählen" />
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Düsendurchmesser (mm)</label>
        <Input
          placeholder="0.4"
          value={currentPart?.nozzleDiameter || ''}
          onChange={handleNozzleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Filament Type</label>
        <Select onValueChange={handleFilamentChange} value={currentPart?.filamentType || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Filament wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PLA">PLA</SelectItem>
            <SelectItem value="ABS">ABS</SelectItem>
            <SelectItem value="PETG">PETG</SelectItem>
            <SelectItem value="TPU">TPU</SelectItem>
            <SelectItem value="WOOD">Wood Fill</SelectItem>
            <SelectItem value="METAL">Metal Fill</SelectItem>
            <SelectItem value="CARBON">Carbon Fiber</SelectItem>
            <SelectItem value="NYLON">Nylon</SelectItem>
            <SelectItem value="PC">Polycarbonate</SelectItem>
            <SelectItem value="ASA">ASA</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ColorMachineFields;
