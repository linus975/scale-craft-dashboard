
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

export const useDesignFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [gcodeFiles, setGcodeFiles] = useState<Record<string, File>>({});
  
  const { toast } = useToast();
  const { uploadFile } = useFileUpload();

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, partId?: string, expectedFileType?: 'f3d' | 'ini' | 'gcode') => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    try {
      const newFiles = [];
      
      for (const file of Array.from(files)) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        // Validate file type if expectedFileType is specified
        if (expectedFileType) {
          if (expectedFileType === 'f3d' && fileExtension !== 'f3d') {
            toast({
              title: "Wrong file type",
              description: "Please upload a .f3d file for CAD.",
              variant: "destructive",
            });
            continue;
          }
          
          if (expectedFileType === 'ini' && fileExtension !== 'ini') {
            toast({
              title: "Wrong file type", 
              description: "Please upload a .ini file for configuration.",
              variant: "destructive",
            });
            continue;
          }
          
          if (expectedFileType === 'gcode' && !['gcode', 'g'].includes(fileExtension || '')) {
            toast({
              title: "Wrong file type",
              description: "Please upload a .gcode or .g file.",
              variant: "destructive",
            });
            continue;
          }
        }

        // Upload file to Supabase Storage
        const filePath = await uploadFile(file, `designs/${partId || 'main'}`);
        
        const newFile = {
          id: Date.now() + Math.random() + '',
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: filePath,
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

      // Remove existing files of the same type and part
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

      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) were successfully uploaded.`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload error",
        description: "There was an error uploading the files.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  const handleFileRemove = (file: any) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    toast({
      title: "File deleted",
      description: `${file.name} was successfully deleted.`,
    });
  };

  const handleFileDownload = (file: any) => {
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

  // Upload preview image to storage and return path
  const uploadPreviewImage = async (): Promise<string | null> => {
    if (!previewImage) return null;
    
    try {
      console.log('Uploading preview image:', previewImage.name);
      const path = await uploadFile(previewImage, 'preview-images');
      console.log('Preview image uploaded to path:', path);
      return path;
    } catch (error) {
      console.error('Error uploading preview image:', error);
      throw error;
    }
  };

  // Upload G-Code file to storage and return path and content
  const uploadGcodeFile = async (partId: string): Promise<{ path: string | null; content: string | null }> => {
    const gcodeFile = gcodeFiles[partId];
    if (!gcodeFile) return { path: null, content: null };

    try {
      console.log('Uploading G-Code file:', gcodeFile.name);
      const path = await uploadFile(gcodeFile, 'gcode-files');
      console.log('G-Code file uploaded to path:', path);
      
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(gcodeFile);
      });

      return { path, content };
    } catch (error) {
      console.error('Error uploading G-Code file:', error);
      throw error;
    }
  };

  return {
    uploadedFiles,
    uploading,
    previewImage,
    gcodeFiles,
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
