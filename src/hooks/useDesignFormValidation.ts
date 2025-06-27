
import { useState } from 'react';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'personalizable';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
  nozzleDiameter?: string;
  filamentType?: string;
  color?: string;
  machine?: string;
}

export const useDesignFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateDesignPart = (part: DesignPart) => {
    const newErrors: Record<string, string> = {};

    if (!part.name.trim()) {
      newErrors.name = 'Part name is required';
    }

    if (part.partType === 'personalizable') {
      if (!part.parameters?.sketchName?.trim()) {
        newErrors.sketchName = 'Sketch name is required for personalizable parts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateDesignPart,
    clearErrors
  };
};
