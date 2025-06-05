
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useDesignFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  // Change to store G-code files per part
  const [gcodeFiles, setGcodeFiles] = useState<Record<string, File>>({});
  
  const { toast } = useToast();

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, partId?: string, expectedFileType?: 'f3d' | 'ini' | 'gcode') => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newFiles = Array.from(files).map(file => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        // Validate file type if expectedFileType is specified
        if (expectedFileType) {
          if (expectedFileType === 'f3d' && fileExtension !== 'f3d') {
            toast({
              title: "Wrong file type",
              description: "Please upload a .f3d file for CAD.",
              variant: "destructive",
            });
            setUploading(false);
            return null;
          }
          
          if (expectedFileType === 'ini' && fileExtension !== 'ini') {
            toast({
              title: "Wrong file type", 
              description: "Please upload a .ini file for configuration.",
              variant: "destructive",
            });
            setUploading(false);
            return null;
          }
          
          if (expectedFileType === 'gcode' && !['gcode', 'g'].includes(fileExtension || '')) {
            toast({
              title: "Wrong file type",
              description: "Please upload a .gcode or .g file.",
              variant: "destructive",
            });
            setUploading(false);
            return null;
          }
        }
        
        return {
          id: Date.now() + Math.random() + '',
          name: file.name,
          type: getFileType(file.name),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          path: `temp/${file.name}`,
          originalName: file.name,
          partId: partId || 'main',
          designType: 'static' as const,
          fileExtension: fileExtension,
          // Separate storage for F3D and INI files
          isF3DFile: fileExtension === 'f3d',
          isINIFile: fileExtension === 'ini',
          // Add upload context to distinguish between different upload areas
          uploadContext: expectedFileType || 'general'
        };
      }).filter(file => file !== null);

      if (newFiles.length === 0) {
        setUploading(false);
        return;
      }

      // Remove existing files of the same type and part to ensure only one F3D and one INI per part
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

      setUploading(false);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) were successfully uploaded.`,
      });
    }, 1000);

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

  // Helper function to get G-code file for specific part
  const getGcodeFileForPart = (partId: string) => {
    return gcodeFiles[partId] || null;
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
    getGcodeFileForPart
  };
};
