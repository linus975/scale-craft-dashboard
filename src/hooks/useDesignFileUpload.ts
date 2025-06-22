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
  designType?: 'static' | 'personalized';
  fileExtension?: string;
  isF3DFile?: boolean;
  isINIFile?: boolean;
  uploadContext?: string;
}

export const useDesignFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [gcodeFiles, setGcodeFiles] = useState<Record<string, File>>({});
  
  const { toast } = useToast();
  const { uploadFile, uploadMultipleFiles, uploading, uploadProgress } = useHighPerformanceUpload();

  const handlePreviewImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setPreviewImage(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreviewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(file);
    }
  };

  const handleGcodeFileChange = (event: React.ChangeEvent<HTMLInputElement>, partId: string = 'main') => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!['gcode', 'g'].includes(fileExtension || '')) {
        toast({
          title: "Wrong file type",
          description: "Please upload a .gcode or .g file.",
          variant: "destructive",
        });
        return;
      }
      
      setGcodeFiles(prev => ({
        ...prev,
        [partId]: file
      }));
      
      toast({
        title: "G-Code file selected",
        description: `${file.name} was successfully selected for ${partId}.`,
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    partId?: string, 
    expectedFileType?: 'f3d' | 'ini' | 'gcode'
  ) => {
    const files = event.target.files;
    if (!files) return;

    const filesToUpload = Array.from(files);
    
    // Quick validation - no complex size checks
    const validFiles = filesToUpload.filter(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // Simple file type validation
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
      console.log(`🚀 TURBO UPLOAD: ${validFiles.length} files`);
      
      // Use lightning-fast parallel upload
      const folderPath = partId ? `parts/${partId}` : 'general';
      const uploadResults = await uploadMultipleFiles(validFiles, folderPath);
      
      // Process successful uploads
      const newFiles: UploadedFile[] = [];
      uploadResults.forEach((result, index) => {
        if (result.path) {
          const file = result.file;
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          const newFile: UploadedFile = {
            id: Date.now() + Math.random() + index + '',
            name: file.name,
            type: getFileType(file.name),
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            path: result.path,
            originalName: file.name,
            partId: partId || 'main',
            designType: 'static' as const,
            fileExtension: fileExtension,
            isF3DFile: fileExtension === 'f3d',
            isINIFile: fileExtension === 'ini',
            uploadContext: expectedFileType || 'general'
          };

          newFiles.push(newFile);
        }
      });

      // Update uploaded files
      setUploadedFiles(prev => {
        const filteredPrev = prev.filter(existingFile => {
          const newFileTypes = newFiles.map(nf => ({ 
            extension: nf?.fileExtension, 
            partId: nf?.partId,
            uploadContext: nf?.uploadContext
          }));
          return !newFileTypes.some(nf => 
            nf.extension === existingFile.fileExtension && 
            nf.partId === existingFile.partId &&
            nf.uploadContext === existingFile.uploadContext
          );
        });
        return [...filteredPrev, ...newFiles];
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
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    toast({
      title: "File deleted",
      description: `${file.name} was successfully deleted.`,
    });
  };

  const handleFileDownload = (file: UploadedFile) => {
    console.log('Downloading file:', file.name);
  };

  const removeGcodeFile = (partId: string = 'main') => {
    setGcodeFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[partId];
      return newFiles;
    });
  };

  const getGcodeFileForPart = (partId: string) => {
    return gcodeFiles[partId] || null;
  };

  // Blazing fast preview image upload
  const uploadPreviewImage = async (): Promise<string | null> => {
    if (!previewImage) return null;
    
    try {
      console.log('📸 TURBO PREVIEW UPLOAD:', previewImage.name);
      const path = await uploadFile(previewImage, 'previews');
      console.log('✅ Preview uploaded at light speed:', path);
      return path;
    } catch (error) {
      console.error('❌ Preview upload error:', error);
      throw error;
    }
  };

  // Lightning fast G-Code upload
  const uploadGcodeFile = async (partId: string): Promise<{ path: string | null; content: string | null }> => {
    const gcodeFile = gcodeFiles[partId];
    if (!gcodeFile) return { path: null, content: null };

    try {
      console.log('⚙️ TURBO GCODE UPLOAD:', gcodeFile.name);
      const path = await uploadFile(gcodeFile, 'gcode');
      console.log('✅ G-Code uploaded at light speed:', path);
      
      return { path, content: null };
    } catch (error) {
      console.error('❌ G-Code upload error:', error);
      throw error;
    }
  };

  return {
    uploadedFiles,
    uploading,
    uploadProgress,
    previewImage,
    gcodeFiles,
    uploadFile, // Expose the turbo upload method
    setUploadedFiles,
    handlePreviewImageDrop,
    handlePreviewImageChange,
    handleGcodeFileChange,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload,
    removeGcodeFile,
    getGcodeFileForPart,
    uploadPreviewImage,
    uploadGcodeFile
  };
};
