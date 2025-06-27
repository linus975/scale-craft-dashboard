
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface FileUpload {
  uploadedFiles: any[];
  previewImage: File | null;
}

export const useDesignFormValidation = (designParts: any, fileUpload: FileUpload) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

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

  const validateForm = (formData: any) => {
    // Basic validation - name is required
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Design name is required",
        variant: "destructive",
      });
      return false;
    }

    // Check for personalizable parts validation
    for (const part of designParts.designParts) {
      if (part.partType === 'personalizable') {
        // Check if F3D and INI files are provided for personalizable parts
        const partFiles = fileUpload.uploadedFiles.filter(f => f.partId === part.id);
        const hasF3D = partFiles.some(f => f.name.toLowerCase().endsWith('.f3d'));
        const hasINI = partFiles.some(f => f.name.toLowerCase().endsWith('.ini'));
        
        if (!hasF3D || !hasINI) {
          toast({
            title: "Missing Files",
            description: `Personalizable part "${part.name}" requires both F3D and INI files`,
            variant: "destructive",
          });
          return false;
        }

        // Check if sketch name is provided for personalizable parts
        if (!part.parameters?.sketchName?.trim()) {
          toast({
            title: "Missing Parameter",
            description: `Personalizable part "${part.name}" requires a sketch name`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateDesignPart,
    validateForm,
    clearErrors
  };
};
