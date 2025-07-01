
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TempUploadedFile {
  id: string;
  name: string;
  tempPath: string;
  file: File;
  category: 'CAD' | 'INI' | 'GCODE';
  partId: string;
  uploadedAt: number;
}

export const useTempFileUpload = () => {
  const [tempFiles, setTempFiles] = useState<TempUploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const tempFileIds = useRef<Set<string>>(new Set());

  const cleanupTempFiles = async (fileIds?: string[]) => {
    const idsToCleanup = fileIds || Array.from(tempFileIds.current);
    
    if (idsToCleanup.length === 0) {
      console.log('🧹 [TempUpload] No temp files to cleanup');
      return;
    }

    console.log('🧹 [TempUpload] Cleaning up temp files:', idsToCleanup.length);
    
    for (const fileId of idsToCleanup) {
      const tempFile = tempFiles.find(f => f.id === fileId);
      if (tempFile) {
        try {
          console.log('🗑️ [TempUpload] Deleting from storage:', tempFile.tempPath);
          const { error } = await supabase.storage
            .from('design-files')
            .remove([tempFile.tempPath]);
          
          if (error) {
            console.warn('❌ [TempUpload] Failed to cleanup temp file:', tempFile.tempPath, error);
          } else {
            console.log('✅ [TempUpload] Successfully deleted temp file:', tempFile.tempPath);
          }
        } catch (error) {
          console.warn('❌ [TempUpload] Cleanup error:', error);
        }
      }
    }
    
    if (!fileIds) {
      tempFileIds.current.clear();
      setTempFiles([]);
    } else {
      fileIds.forEach(id => tempFileIds.current.delete(id));
      setTempFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
    }
  };

  useEffect(() => {
    return () => {
      if (tempFileIds.current.size > 0) {
        console.log('🧹 [TempUpload] Component unmounting, cleaning up temp files');
        cleanupTempFiles();
      }
    };
  }, []);

  const uploadToTemp = async (
    file: File,
    partId: string,
    fileCategory: 'CAD' | 'INI' | 'GCODE'
  ): Promise<TempUploadedFile | null> => {
    setUploading(true);
    
    try {
      console.log('📤 [TempUpload] Starting temp upload:', file.name);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const timestamp = Date.now();
      const tempFileName = `${timestamp}-${file.name}`;
      const tempPath = `${user.id}/temp/${fileCategory}/${tempFileName}`;
      
      console.log('📁 [TempUpload] Temp path:', tempPath);

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(tempPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [TempUpload] Upload error:', error);
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      const tempFile: TempUploadedFile = {
        id: `temp-${timestamp}-${Math.random()}`,
        name: file.name,
        tempPath: data.path,
        file: file,
        category: fileCategory,
        partId: partId,
        uploadedAt: timestamp
      };

      tempFileIds.current.add(tempFile.id);
      setTempFiles(prev => [...prev, tempFile]);

      console.log('✅ [TempUpload] Temp file uploaded:', tempFile.tempPath);
      
      return tempFile;

    } catch (error: any) {
      console.error('❌ [TempUpload] Upload failed:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Upload",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeTempFile = async (fileId: string) => {
    console.log('🗑️ [TempUpload] Removing temp file:', fileId);
    
    const tempFile = tempFiles.find(f => f.id === fileId);
    if (tempFile) {
      try {
        console.log('🗑️ [TempUpload] Deleting from storage:', tempFile.tempPath);
        const { error } = await supabase.storage
          .from('design-files')
          .remove([tempFile.tempPath]);
        
        if (error) {
          console.warn('❌ [TempUpload] Failed to delete temp file:', tempFile.tempPath, error);
        } else {
          console.log('✅ [TempUpload] Successfully deleted temp file:', tempFile.tempPath);
        }
      } catch (error) {
        console.warn('❌ [TempUpload] Delete error:', error);
      }
    }
    
    // Remove from tracking
    tempFileIds.current.delete(fileId);
    setTempFiles(prev => prev.filter(f => f.id !== fileId));
    
    toast({
      title: "Temporäre Datei entfernt",
      description: "Die Datei wurde aus dem temporären Speicher gelöscht.",
    });
  };

  const moveToFinal = async (
    tempFile: TempUploadedFile,
    finalPath: string
  ): Promise<string | null> => {
    try {
      console.log('📦 [TempUpload] Moving temp file to final location:');
      console.log('📦 [TempUpload] From:', tempFile.tempPath);
      console.log('📦 [TempUpload] To:', finalPath);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const fullFinalPath = `${user.id}/${finalPath}`;
      
      // Download the file from temp location
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('design-files')
        .download(tempFile.tempPath);

      if (downloadError) {
        console.error('❌ [TempUpload] Download error:', downloadError);
        throw new Error(`Fehler beim Herunterladen: ${downloadError.message}`);
      }

      console.log('✅ [TempUpload] File downloaded from temp location, size:', fileData.size);

      // Upload to final location
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(fullFinalPath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ [TempUpload] Upload to final location error:', uploadError);
        throw new Error(`Fehler beim Upload: ${uploadError.message}`);
      }

      console.log('✅ [TempUpload] File uploaded to final location:', uploadData.path);

      // Delete temp file after successful move
      const { error: deleteError } = await supabase.storage
        .from('design-files')
        .remove([tempFile.tempPath]);

      if (deleteError) {
        console.warn('⚠️ [TempUpload] Warning: Could not delete temp file:', deleteError);
      } else {
        console.log('✅ [TempUpload] Temp file deleted successfully');
      }

      // Remove from tracking
      tempFileIds.current.delete(tempFile.id);
      setTempFiles(prev => prev.filter(f => f.id !== tempFile.id));

      console.log('✅ [TempUpload] File moved successfully to:', fullFinalPath);
      return uploadData.path;

    } catch (error: any) {
      console.error('❌ [TempUpload] Move failed:', error);
      throw error;
    }
  };

  const getTempFilesForPart = (partId: string): TempUploadedFile[] => {
    return tempFiles.filter(f => f.partId === partId);
  };

  return {
    tempFiles,
    uploading,
    uploadToTemp,
    removeTempFile,
    cleanupTempFiles,
    moveToFinal,
    getTempFilesForPart
  };
};
