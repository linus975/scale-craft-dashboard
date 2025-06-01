
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SoftwareSelectorsProps {
  cadSoftware?: string;
  slicer?: string;
  onSoftwareChange: (field: 'cadSoftware' | 'slicer', value: string) => void;
  disabled?: boolean;
  showOnlyCAD?: boolean;
  showOnlySlicer?: boolean;
}

const SoftwareSelectors: React.FC<SoftwareSelectorsProps> = ({
  cadSoftware,
  slicer,
  onSoftwareChange,
  disabled = false,
  showOnlyCAD = false,
  showOnlySlicer = false
}) => {
  const showCAD = !showOnlySlicer;
  const showSlicer = !showOnlyCAD;

  return (
    <div className={`${(!showOnlyCAD && !showOnlySlicer) ? 'grid grid-cols-2 gap-4' : ''}`}>
      {showCAD && (
        <div className="space-y-2">
          <Label>CAD Software *</Label>
          <Select
            value={cadSoftware}
            onValueChange={(value) => onSoftwareChange('cadSoftware', value)}
            disabled={disabled}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select CAD software" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fusion360">Fusion 360</SelectItem>
              <SelectItem value="solidworks">SolidWorks</SelectItem>
              <SelectItem value="autocad">AutoCAD</SelectItem>
              <SelectItem value="inventor">Inventor</SelectItem>
              <SelectItem value="creo">Creo</SelectItem>
              <SelectItem value="catia">CATIA</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {showSlicer && (
        <div className="space-y-2">
          <Label>Slicer Software *</Label>
          <Select
            value={slicer}
            onValueChange={(value) => onSoftwareChange('slicer', value)}
            disabled={disabled}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select slicer software" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prusa">PrusaSlicer</SelectItem>
              <SelectItem value="cura">Ultimaker Cura</SelectItem>
              <SelectItem value="superslicer">SuperSlicer</SelectItem>
              <SelectItem value="bambu">Bambu Studio</SelectItem>
              <SelectItem value="simplify3d">Simplify3D</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default SoftwareSelectors;
