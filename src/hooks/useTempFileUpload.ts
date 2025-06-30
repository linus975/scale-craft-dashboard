
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

  // Cleanup function to remove temp files
  const cleanupTempFiles = async (fileIds?: string[]) => {
    const idsToCleanup = fileIds || Array.from(tempFileIds.current);
    
    for (const fileId of idsToCleanup) {
      const tempFile = tempFiles.find(f => f.id === fileId);
      if (tempFile) {
        try {
          const { error } = await supabase.storage
            .from('design-files')
            .remove([tempFile.tempPath]);
          
          if (error) {
            console.warn('❌ [TempUpload] Failed to cleanup temp file:', tempFile.tempPath, error);
          } else {
            console.log('🧹 [TempUpload] Cleaned up temp file:', tempFile.tempPath);
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

  // Auto-cleanup on component unmount
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

      // Create temp path with timestamp to avoid conflicts
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

      // Track temp file for cleanup
      tempFileIds.current.add(tempFile.id);
      setTempFiles(prev => [...prev, tempFile]);

      console.log('✅ [TempUpload] Temp file uploaded:', tempFile.tempPath);
      
      toast({
        title: "Datei temporär hochgeladen",
        description: `${file.name} wurde temporär gespeichert.`,
      });

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
    await cleanupTempFiles([fileId]);
    
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
      console.log('📦 [TempUpload] Moving temp file to final location:', tempFile.tempPath, '->', finalPath);
      
      // Copy file to final location
      const { data, error } = await supabase.storage
        .from('design-files')
        .copy(tempFile.tempPath, finalPath);

      if (error) {
        console.error('❌ [TempUpload] Move error:', error);
        throw new Error(`Fehler beim Verschieben: ${error.message}`);
      }

      // Remove from temp location
      await cleanupTempFiles([tempFile.id]);

      console.log('✅ [TempUpload] File moved successfully to:', finalPath);
      return finalPath;

    } catch (error: any) {
      console.error('❌ [TempUpload] Move failed:', error);
      return null;
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
