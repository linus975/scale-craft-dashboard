
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ColorMachineFieldsProps {
  colorValue?: string;
  machineValue?: string;
  formControl?: any;
}

const ColorMachineFields: React.FC<ColorMachineFieldsProps> = ({
  colorValue,
  machineValue,
  formControl
}) => {
  if (colorValue === undefined && machineValue === undefined) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {colorValue !== undefined && formControl && (
        <FormField
          control={formControl}
          name="color"
          rules={{ required: "Color is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color *</FormLabel>
              <FormControl>
                <Input placeholder="Enter color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {machineValue !== undefined && formControl && (
        <FormField
          control={formControl}
          name="machine"
          rules={{ required: "Machine is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Machine *</FormLabel>
              <FormControl>
                <Input placeholder="Enter machine name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ColorMachineFields;
