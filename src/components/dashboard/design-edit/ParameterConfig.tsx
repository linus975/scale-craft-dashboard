
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
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
  if (!hasPersonalizedFiles) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h5 className="font-medium">Parameter für personalisierbare Dateien in "{currentPart.name}"</h5>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sketch-Name</Label>
          <Input
            placeholder="Name des Sketches"
            value={currentPart.parameters?.sketchName || ''}
            onChange={(e) => onPartParametersChange(currentPart.id, 'sketchName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Ersetzungsparameter</Label>
          <Input
            placeholder="Parameter zum Ersetzen"
            value={currentPart.parameters?.replacementValue || ''}
            onChange={(e) => onPartParametersChange(currentPart.id, 'replacementValue', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ParameterConfig;
