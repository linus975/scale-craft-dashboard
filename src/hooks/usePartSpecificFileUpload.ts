
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHighPerformanceUpload } from '@/hooks/useHighPerformanceUpload';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
  designType?: 'static' | 'personalizable';
  fileExtension?: string;
  isF3DFile?: boolean;
  isINIFile?: boolean;
  uploadContext?: string;
}

export const usePartSpecificFileUpload = () => {
  const [partFiles, setPartFiles] = useState<Record<string, UploadedFile[]>>({});
  const [gcodeFiles, setGcodeFiles] = useState<Record<string, File>>({});
  
  const { toast } = useToast();
  const { uploadFile, uploadMultipleFiles, uploading, uploadProgress } = useHighPerformanceUpload();

  const getFileTypeFolder = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
      case 'step':
      case 'stp':
      case 'stl':
        return 'cad-files';
      case 'ini':
        return 'ini-files';
      case 'gcode':
      case 'g':
        return 'gcode-files';
      default:
        return 'other-files';
    }
  };

  // Fixed: Always use the provided partId for file uploads
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    partId: string,
    expectedFileType?: 'f3d' | 'ini' | 'gcode'
  ) => {
    const files = event.target.files;
    if (!files || !partId) return;

    const filesToUpload = Array.from(files);
    
    // File validation
    const validFiles = filesToUpload.filter(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (expectedFileType) {
        if (expectedFileType === 'f3d' && fileExtension !== 'f3d') {
          toast({
            title: "Falscher Dateityp",
            description: "Bitte laden Sie eine .f3d Datei für CAD hoch.",
            variant: "destructive",
          });
          return false;
        }
        
        if (expectedFileType === 'ini' && fileExtension !== 'ini') {
          toast({
            title: "Falscher Dateityp", 
            description: "Bitte laden Sie eine .ini Datei für die Konfiguration hoch.",
            variant: "destructive",
          });
          return false;
        }
        
        if (expectedFileType === 'gcode' && !['gcode', 'g'].includes(fileExtension || '')) {
          toast({
            title: "Falscher Dateityp",
            description: "Bitte laden Sie eine .gcode oder .g Datei hoch.",
            variant: "destructive",
          });
          return false;
        }
      }

      return true;
    });

    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    try {
      console.log(`🚀 Part-specific upload for SELECTED part ${partId}: ${validFiles.length} files`);
      
      // Process each file individually with proper folder structure
      const newFiles: UploadedFile[] = [];
      
      for (const file of validFiles) {
        const fileTypeFolder = getFileTypeFolder(file.name);
        const folderPath = `parts/${partId}/${fileTypeFolder}`;
        
        try {
          const uploadPath = await uploadFile(file, folderPath);
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          const newFile: UploadedFile = {
            id: Date.now() + Math.random() + '',
            name: file.name,
            type: getFileType(file.name),
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            path: uploadPath,
            originalName: file.name,
            partId: partId, // IMPORTANT: Always use the provided partId
            designType: 'static' as const,
            fileExtension: fileExtension,
            isF3DFile: fileExtension === 'f3d',
            isINIFile: fileExtension === 'ini',
            uploadContext: expectedFileType || 'general'
          };

          newFiles.push(newFile);
          console.log(`✅ File uploaded to part ${partId}: ${folderPath}/${file.name}`);
        } catch (uploadError) {
          console.error(`❌ Error uploading ${file.name}:`, uploadError);
        }
      }

      // Update part-specific files - ONLY for the selected partId
      setPartFiles(prev => {
        const currentPartFiles = prev[partId] || [];
        const filteredFiles = currentPartFiles.filter(existingFile => {
          const newFileTypes = newFiles.map(nf => ({ 
            extension: nf?.fileExtension, 
            uploadContext: nf?.uploadContext
          }));
          return !newFileTypes.some(nf => 
            nf.extension === existingFile.fileExtension && 
            nf.uploadContext === existingFile.uploadContext
          );
        });
        
        return {
          ...prev,
          [partId]: [...filteredFiles, ...newFiles]
        };
      });

      toast({
        title: "Dateien hochgeladen",
        description: `${newFiles.length} Datei(en) für Part "${partId}" erfolgreich hochgeladen.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload-Fehler",
        description: "Es gab einen Fehler beim Hochladen der Dateien.",
        variant: "destructive",
      });
    }

    event.target.value = '';
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
        return 'Fusion 360 File';
      case 'step':
      case 'stp':
        return 'STEP File';
      case 'stl':
        return 'STL File';
      case 'ini':
        return 'Settings File';
      case 'gcode':
        return 'G-Code File';
      default:
        return 'Unknown';
    }
  };

  const handleFileRemove = (file: UploadedFile) => {
    if (!file.partId) return;
    
    setPartFiles(prev => ({
      ...prev,
      [file.partId!]: (prev[file.partId!] || []).filter(f => f.id !== file.id)
    }));
    
    toast({
      title: "Datei gelöscht",
      description: `${file.name} wurde erfolgreich gelöscht.`,
    });
  };

  const handleFileDownload = (file: UploadedFile) => {
    console.log('Downloading file:', file.name, 'from path:', file.path);
  };

  const getFilesForPart = (partId: string): UploadedFile[] => {
    return partFiles[partId] || [];
  };

  const getAllFiles = (): UploadedFile[] => {
    return Object.values(partFiles).flat();
  };

  // G-code file handling per part with organized storage
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
    partFiles,
    gcodeFiles,
    uploading,
    uploadProgress,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload,
    getFilesForPart,
    getAllFiles,
    handleGcodeFileChange,
    removeGcodeFile,
    getGcodeFileForPart,
    uploadGcodeFile,
    setPartFiles
  };
};
