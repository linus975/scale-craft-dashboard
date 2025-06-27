
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHighPerformanceUpload } from '@/hooks/useHighPerformanceUpload';

export const useGcodeFileManager = () => {
  const [gcodeFiles, setGcodeFiles] = useState<Record<string, File>>({});
  const { toast } = useToast();
  const { uploadFile } = useHighPerformanceUpload();

  const handleGcodeFileChange = (event: React.ChangeEvent<HTMLInputElement>, partId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!['gcode', 'g'].includes(fileExtension || '')) {
        toast({
          title: "Falscher Dateityp",
          description: "Bitte laden Sie eine .gcode oder .g Datei hoch.",
          variant: "destructive",
        });
        return;
      }
      
      setGcodeFiles(prev => ({
        ...prev,
        [partId]: file
      }));
      
      toast({
        title: "G-Code Datei ausgewählt",
        description: `${file.name} wurde erfolgreich für Part "${partId}" ausgewählt.`,
      });
    }
  };

  const removeGcodeFile = (partId: string) => {
    setGcodeFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[partId];
      return newFiles;
    });
  };

  const getGcodeFileForPart = (partId: string) => {
    return gcodeFiles[partId] || null;
  };

  const uploadGcodeFile = async (partId: string): Promise<{ path: string | null; content: string | null }> => {
    const gcodeFile = gcodeFiles[partId];
    if (!gcodeFile) return { path: null, content: null };

    try {
      console.log(`⚙️ Uploading G-Code for part ${partId}:`, gcodeFile.name);
      const path = await uploadFile(gcodeFile, `parts/${partId}/gcode-files`);
      console.log('✅ G-Code uploaded to organized folder:', path);
      
      return { path, content: null };
    } catch (error) {
      console.error('❌ G-Code upload error:', error);
      throw error;
    }
  };

  return {
    gcodeFiles,
    handleGcodeFileChange,
    removeGcodeFile,
    getGcodeFileForPart,
    uploadGcodeFile
  };
};
