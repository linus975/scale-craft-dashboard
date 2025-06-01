
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CADParametersInputsProps {
  partId: string;
}

const CADParametersInputs: React.FC<CADParametersInputsProps> = ({ partId }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      <div className="space-y-1">
        <Label htmlFor={`sketchName-${partId}`} className="text-xs">
          Sketch Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`sketchName-${partId}`}
          placeholder="Enter sketch name"
          className="h-8 text-xs"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`replacementType-${partId}`} className="text-xs">
          Replacement Type <span className="text-red-500">*</span>
        </Label>
        <Select required>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text from Marketplace</SelectItem>
            <SelectItem value="dimension">Dimension</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CADParametersInputs;
