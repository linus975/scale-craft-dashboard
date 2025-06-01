
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SoftwareSelectorsProps {
  cadSoftware?: string;
  slicer?: string;
  onSoftwareChange: (field: 'cadSoftware' | 'slicer', value: string) => void;
  disabled?: boolean;
}

const SoftwareSelectors: React.FC<SoftwareSelectorsProps> = ({
  cadSoftware,
  slicer,
  onSoftwareChange,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>CAD Software</Label>
        <Select
          value={cadSoftware || undefined}
          onValueChange={(value) => onSoftwareChange('cadSoftware', value)}
          disabled={disabled}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select CAD software" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fusion360">Fusion 360</SelectItem>
            <SelectItem value="solidworks">SolidWorks</SelectItem>
            <SelectItem value="blender">Blender</SelectItem>
            <SelectItem value="freecad">FreeCAD</SelectItem>
            <SelectItem value="onshape">Onshape</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Slicer Software</Label>
        <Select
          value={slicer || undefined}
          onValueChange={(value) => onSoftwareChange('slicer', value)}
          disabled={disabled}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select slicer software" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cura">Ultimaker Cura</SelectItem>
            <SelectItem value="prusaslicer">PrusaSlicer</SelectItem>
            <SelectItem value="superslicer">SuperSlicer</SelectItem>
            <SelectItem value="bambu">Bambu Studio</SelectItem>
            <SelectItem value="simplify3d">Simplify3D</SelectItem>
            <SelectItem value="ideamaker">IdeaMaker</SelectItem>
            <SelectItem value="slic3r">Slic3r</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SoftwareSelectors;
