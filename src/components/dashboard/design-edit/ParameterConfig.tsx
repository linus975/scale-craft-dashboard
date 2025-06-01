
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
}

interface ParameterConfigProps {
  currentPart: DesignPart;
  hasPersonalizedFiles: boolean;
  onPartParametersChange: (partId: string, field: string, value: string) => void;
}

const ParameterConfig: React.FC<ParameterConfigProps> = ({
  currentPart,
  hasPersonalizedFiles,
  onPartParametersChange
}) => {
  if (!hasPersonalizedFiles || currentPart?.partType !== 'personalized') {
    return null;
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h5 className="font-medium">Parameter für personalisierbare Dateien in "{currentPart.name}"</h5>
      
      <div className="space-y-4">
        <div>
          <Label>Sketch-Name</Label>
          <Input
            placeholder="Name des Sketches"
            value={currentPart.parameters?.sketchName || ''}
            onChange={(e) => onPartParametersChange(currentPart.id, 'sketchName', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ersetzungsparameter</Label>
            <Input
              placeholder="Parameter zum Ersetzen"
              value={currentPart.parameters?.replacementValue || ''}
              onChange={(e) => onPartParametersChange(currentPart.id, 'replacementValue', e.target.value)}
            />
          </div>
          
          <div>
            <Label>Dynamisches Objekt</Label>
            <Select
              value={currentPart.parameters?.replacementType || 'text'}
              onValueChange={(value) => onPartParametersChange(currentPart.id, 'replacementType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Objekttyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="dimension">Maße</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterConfig;
