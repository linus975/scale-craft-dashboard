
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
    localPartId: string, // CRITICAL: This is the local frontend part ID, not database ID
    expectedFileType?: ExpectedFileType
  ) => {
    const files = event.target.files;
    if (!files || !localPartId) {
      console.error('❌ [useFileUploadManager] Missing files or localPartId');
      console.log('  - Files:', files?.length || 0);
      console.log('  - LocalPartId:', localPartId);
      return;
    }

    console.log('🎯 [useFileUploadManager] UPLOAD START:');
    console.log('  - Target LOCAL part ID:', localPartId);
    console.log('  - Files to upload:', files.length);
    console.log('  - Expected file type:', expectedFileType || 'any');
    console.log('  - Current partFiles state:', Object.keys(partFiles).map(key => ({ partId: key, fileCount: partFiles[key].length })));

    const filesToUpload = Array.from(files);
    const validFiles = validateFiles(filesToUpload, expectedFileType);

    if (validFiles.length === 0) {
      console.log('❌ [useFileUploadManager] No valid files found after validation');
      event.target.value = '';
      return;
    }

    try {
      console.log('✅ [useFileUploadManager] Processing valid files:', validFiles.map(f => f.name));
      
      const newFiles: UploadedFile[] = [];
      
      for (const file of validFiles) {
        const fileTypeFolder = getFileTypeFolder(file.name);
        // CRITICAL: Use the local part ID in the upload path for organization
        const folderPath = `temp-parts/${localPartId}/${fileTypeFolder}`;
        
        try {
          console.log(`📤 [useFileUploadManager] Uploading "${file.name}" to ${folderPath} for LOCAL part ${localPartId}`);
          const uploadPath = await uploadFile(file, folderPath);
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          const newFile: UploadedFile = {
            id: `${localPartId}-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: getFileType(file.name),
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            path: uploadPath,
            originalName: file.name,
            partId: localPartId, // CRITICAL: Store the LOCAL part ID
            designType: 'static' as const,
            fileExtension: fileExtension,
            isF3DFile: fileExtension === 'f3d',
            isINIFile: fileExtension === 'ini',
            uploadContext: expectedFileType || 'general'
          };

          newFiles.push(newFile);
          console.log(`✅ [useFileUploadManager] File uploaded successfully: ${file.name}`);
          console.log('  - File object:', newFile);
        } catch (uploadError) {
          console.error(`❌ [useFileUploadManager] Error uploading ${file.name}:`, uploadError);
        }
      }

      if (newFiles.length > 0) {
        console.log(`📂 [useFileUploadManager] Adding ${newFiles.length} files to LOCAL part ${localPartId}`);
        
        // CRITICAL: Update files for this specific LOCAL part only
        setPartFiles(prev => {
          const currentPartFiles = prev[localPartId] || [];
          console.log(`📋 [useFileUploadManager] Current files for part ${localPartId}:`, currentPartFiles.map(f => f.name));
          
          // Remove existing files of the same type and context to prevent duplicates
          const filteredFiles = currentPartFiles.filter(existingFile => {
            const newFileTypes = newFiles.map(nf => ({ 
              extension: nf?.fileExtension, 
              uploadContext: nf?.uploadContext
            }));
            const shouldKeep = !newFileTypes.some(nf => 
              nf.extension === existingFile.fileExtension && 
              nf.uploadContext === existingFile.uploadContext
            );
            console.log(`📁 [useFileUploadManager] Existing file "${existingFile.name}" shouldKeep: ${shouldKeep}`);
            return shouldKeep;
          });
          
          const updatedPartFiles = [...filteredFiles, ...newFiles];
          console.log(`📂 [useFileUploadManager] Updated files for LOCAL part ${localPartId}:`, updatedPartFiles.map(f => f.name));
          
          const newState = {
            ...prev,
            [localPartId]: updatedPartFiles
          };
          
          console.log('🔄 [useFileUploadManager] New partFiles state:', Object.keys(newState).map(key => ({ 
            partId: key, 
            fileCount: newState[key].length,
            files: newState[key].map(f => f.name)
          })));
          
          return newState;
        });

        toast({
          title: "Dateien hochgeladen",
          description: `${newFiles.length} Datei(en) für Part erfolgreich hochgeladen.`,
        });
      }

    } catch (error) {
      console.error('❌ [useFileUploadManager] Upload error:', error);
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
      console.error('❌ [useFileUploadManager] Cannot remove file: no partId');
      return;
    }
    
    console.log(`🗑️ [useFileUploadManager] Removing file "${file.name}" from LOCAL part ${file.partId}`);
    
    setPartFiles(prev => {
      const newState = {
        ...prev,
        [file.partId!]: (prev[file.partId!] || []).filter(f => f.id !== file.id)
      };
      
      console.log('🔄 [useFileUploadManager] Updated partFiles after removal:', Object.keys(newState).map(key => ({ 
        partId: key, 
        fileCount: newState[key].length,
        files: newState[key].map(f => f.name)
      })));
      
      return newState;
    });
    
    toast({
      title: "Datei gelöscht",
      description: `${file.name} wurde erfolgreich gelöscht.`,
    });
  };

  const handleFileDownload = (file: UploadedFile) => {
    console.log('📥 [useFileUploadManager] Downloading file:', file.name, 'from path:', file.path);
  };

  const getFilesForPart = (localPartId: string): UploadedFile[] => {
    const files = partFiles[localPartId] || [];
    console.log(`📋 [useFileUploadManager] Getting files for LOCAL part ${localPartId}:`, files.map(f => f.name));
    return files;
  };

  const getAllFiles = (): UploadedFile[] => {
    const allFiles = Object.values(partFiles).flat();
    console.log('📋 [useFileUploadManager] All files across all LOCAL parts:');
    console.log('  - Total files:', allFiles.length);
    console.log('  - Files by part:', allFiles.reduce((acc, file) => {
      acc[file.partId || 'no-part'] = (acc[file.partId || 'no-part'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
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
