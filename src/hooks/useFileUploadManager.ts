import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHighPerformanceUpload } from '@/hooks/useHighPerformanceUpload';
import { getFileTypeFolder, getFileType } from '@/utils/fileTypeUtils';
import { useFileValidation } from '@/utils/fileValidation';
import { getFileCategory } from '@/utils/fileCategories';
import type { UploadedFile, ExpectedFileType } from '@/types/fileUpload';

export const useFileUploadManager = () => {
  const [partFiles, setPartFiles] = useState<Record<string, UploadedFile[]>>({});
  const { toast } = useToast();
  const { uploadFile, uploading, uploadProgress } = useHighPerformanceUpload();
  const { validateFiles } = useFileValidation();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    partId: string,
    expectedFileType?: ExpectedFileType
  ) => {
    const files = event.target.files;
    if (!files || !partId) {
      console.log('❌ No files or partId provided');
      return;
    }

    console.log(`🎯 CRITICAL: Upload ONLY to part: ${partId}`);
    console.log(`📁 Files to upload: ${files.length}`);

    const filesToUpload = Array.from(files);
    const validFiles = validateFiles(filesToUpload, expectedFileType);

    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    try {
      console.log(`✅ Valid files for EXACT part ${partId}: ${validFiles.length}`);
      
      const newFiles: UploadedFile[] = [];
      
      for (const file of validFiles) {
        const fileTypeFolder = getFileTypeFolder(file.name);
        const folderPath = `parts/${partId}/${fileTypeFolder}`;
        
        try {
          const uploadPath = await uploadFile(file, folderPath);
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          const fileCategory = getFileCategory(file.name);
          
          const newFile: UploadedFile = {
            id: `${partId}-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: getFileType(file.name),
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            path: uploadPath,
            originalName: file.name,
            partId: partId,
            designType: 'static' as const,
            fileExtension: fileExtension,
            isF3DFile: fileExtension === 'f3d',
            isINIFile: fileExtension === 'ini',
            uploadContext: expectedFileType || 'general',
            fileCategory: fileCategory // Stelle sicher, dass fileCategory immer gesetzt ist
          };

          newFiles.push(newFile);
          console.log(`✅ File uploaded to EXACT part ${partId}: ${folderPath}/${file.name}`);
        } catch (uploadError) {
          console.error(`❌ Error uploading ${file.name}:`, uploadError);
        }
      }

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
        
        const updatedFiles = {
          ...prev,
          [partId]: [...filteredFiles, ...newFiles]
        };

        console.log(`📂 Updated files for EXACT part ${partId}:`, updatedFiles[partId]);
        return updatedFiles;
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

  const handleFileRemove = (file: UploadedFile) => {
    if (!file.partId) return;
    
    console.log(`🗑️ Removing file ${file.name} from EXACT part ${file.partId}`);
    
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
    const files = partFiles[partId] || [];
    console.log(`📋 Getting files for EXACT part ${partId}:`, files);
    return files;
  };

  const getAllFiles = (): UploadedFile[] => {
    const allFiles = Object.values(partFiles).flat();
    console.log('📋 All files:', allFiles);
    return allFiles;
  };

  return {
    partFiles,
    uploading,
    uploadProgress,
    handleFileUpload,
    handleFileRemove,
    handleFileDownload,
    getFilesForPart,
    getAllFiles,
    setPartFiles
  };
};
