import { useDesignParts } from './useDesignParts';
import { useDesignFileUpload } from './useDesignFileUpload';

interface FormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
  color: string;
}

export const useDesignFormValidation = (
  designParts: ReturnType<typeof useDesignParts>,
  fileUpload: ReturnType<typeof useDesignFileUpload>
) => {
  const validateForm = () => {
    const errors: string[] = [];

    // Validate each part
    designParts.designParts.forEach(part => {
      if (part.partType === 'customisable') {
        // Check for required files
        const validation = designParts.validatePartFiles(part, fileUpload.uploadedFiles);
        if (!validation.hasF3D) {
          errors.push(`Part "${part.name}" requires an F3D file`);
        }
        if (!validation.hasINI) {
          errors.push(`Part "${part.name}" requires an INI file`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return { validateForm };
};
