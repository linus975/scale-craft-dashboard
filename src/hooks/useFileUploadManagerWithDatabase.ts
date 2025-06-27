
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHighPerformanceUpload } from '@/hooks/useHighPerformanceUpload';
import { getFileTypeFolder, getFileType } from '@/utils/fileTypeUtils';
import { useFileValidation } from '@/utils/fileValidation';
import type { UploadedFile, ExpectedFileType } from '@/types/fileUpload';

export const useFileUploadManagerWithDatabase = () => {
  const [partFiles, setPartFiles] = useState<Record<string, UploadedFile[]>>({});
  const { toast } = useToast();
  const { uploadFile, uploading, uploadProgress } = useHighPerformanceUpload();
  const { validateFiles } = useFileValidation();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    partId: string, // CRITICAL: This must be the real database part_id UUID
    expectedFileType?: ExpectedFileType
  ) => {
    const files = event.target.files;
    if (!files || !partId) {
      console.log('❌ No files or partId provided');
      return;
    }

    console.log(`🎯 UPLOAD TARGET: Database part ID: ${partId}`);
    console.log(`📁 Files to upload: ${files.length}`);
    console.log(`🔍 Expected file type: ${expectedFileType || 'any'}`);

    const filesToUpload = Array.from(files);
    const validFiles = validateFiles(filesToUpload, expectedFileType);

    if (validFiles.length === 0) {
      console.log('❌ No valid files found');
      event.target.value = '';
      return;
    }

    try {
      console.log(`✅ Processing ${validFiles.length} valid files for part ${partId}`);
      
      const newFiles: UploadedFile[] = [];
      
      for (const file of validFiles) {
        const fileTypeFolder = getFileTypeFolder(file.name);
        // CRITICAL: Use the real database part_id in the upload path
        const folderPath = `parts/${partId}/${fileTypeFolder}`;
        
        try {
          console.log(`📤 Uploading ${file.name} to ${folderPath}`);
          const uploadPath = await uploadFile(file, folderPath);
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          const newFile: UploadedFile = {
            id: `${partId}-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: getFileType(file.name),
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            path: uploadPath,
            originalName: file.name,
            partId: partId, // CRITICAL: Store the exact database part_id
            designType: 'static' as const,
            fileExtension: fileExtension,
            isF3DFile: fileExtension === 'f3d',
            isINIFile: fileExtension === 'ini',
            uploadContext: expectedFileType || 'general'
          };

          newFiles.push(newFile);
          console.log(`✅ File uploaded successfully for part ${partId}: ${file.name}`);
        } catch (uploadError) {
          console.error(`❌ Error uploading ${file.name}:`, uploadError);
        }
      }

      if (newFiles.length > 0) {
        // CRITICAL: Update files for this specific part only
        setPartFiles(prev => {
          const currentPartFiles = prev[partId] || [];
          
          // Remove existing files of the same type and context to prevent duplicates
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
          
          const updatedPartFiles = [...filteredFiles, ...newFiles];
          
          console.log(`📂 Updated files for part ${partId}:`, updatedPartFiles.map(f => f.name));
          
          return {
            ...prev,
            [partId]: updatedPartFiles
          };
        });

        toast({
          title: "Dateien hochgeladen",
          description: `${newFiles.length} Datei(en) für Part erfolgreich hochgeladen.`,
        });
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Upload-Fehler",
        description: "Es gab einen Fehler beim Hochladen der Dateien.",
        variant: "destructive",
      });
    }

    // Clear the input to allow re-uploading the same file
    event.target.value = '';
  };

  const handleFileRemove = (file: UploadedFile) => {
    if (!file.partId) {
      console.log('❌ Cannot remove file: no partId');
      return;
    }
    
    console.log(`🗑️ Removing file ${file.name} from part ${file.partId}`);
    
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
    console.log('📥 Downloading file:', file.name, 'from path:', file.path);
  };

  const getFilesForPart = (partId: string): UploadedFile[] => {
    const files = partFiles[partId] || [];
    console.log(`📋 Getting files for part ${partId}:`, files.map(f => f.name));
    return files;
  };

  const getAllFiles = (): UploadedFile[] => {
    const allFiles = Object.values(partFiles).flat();
    console.log('📋 All files across all parts:', allFiles.map(f => ({ name: f.name, partId: f.partId })));
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
