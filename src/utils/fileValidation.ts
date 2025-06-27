
import { useToast } from '@/hooks/use-toast';
import { validateFileType } from './fileTypeUtils';
import type { ExpectedFileType } from '@/types/fileUpload';

export const useFileValidation = () => {
  const { toast } = useToast();

  const validateFiles = (files: File[], expectedFileType?: ExpectedFileType): File[] => {
    return files.filter(file => {
      if (!validateFileType(file, expectedFileType)) {
        let message = '';
        
        switch (expectedFileType) {
          case 'f3d':
            message = "Bitte laden Sie eine .f3d Datei für CAD hoch.";
            break;
          case 'ini':
            message = "Bitte laden Sie eine .ini Datei für die Konfiguration hoch.";
            break;
          case 'gcode':
            message = "Bitte laden Sie eine .gcode oder .g Datei hoch.";
            break;
        }
        
        if (message) {
          toast({
            title: "Falscher Dateityp",
            description: message,
            variant: "destructive",
          });
        }
        
        return false;
      }
      return true;
    });
  };

  return { validateFiles };
};
