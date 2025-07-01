
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FastTempFile {
  id: string;
  name: string;
  tempPath: string;
  file: File;
  category: 'CAD' | 'INI' | 'GCODE';
  partId: string;
  uploadedAt: number;
}

export const useFastTempUpload = () => {
  const [tempFiles, setTempFiles] = useState<FastTempFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const tempFileIds = useRef<Set<string>>(new Set());
  const uploadQueue = useRef<Promise<any>[]>([]);

  // Fast cleanup with parallel deletion
  const cleanupTempFiles = async (fileIds?: string[]) => {
    const idsToCleanup = fileIds || Array.from(tempFileIds.current);
    
    if (idsToCleanup.length === 0) return;

    console.log('🧹 [FastTempUpload] Fast cleanup:', idsToCleanup.length, 'files');
    
    // Parallel deletion for speed
    const deletePromises = idsToCleanup.map(async (fileId) => {
      const tempFile = tempFiles.find(f => f.id === fileId);
      if (tempFile) {
        try {
          await supabase.storage
            .from('design-files')
            .remove([tempFile.tempPath]);
        } catch (error) {
          console.warn('⚠️ [FastTempUpload] Cleanup warning:', error);
        }
      }
    });

    await Promise.allSettled(deletePromises);
    
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
        cleanupTempFiles();
      }
    };
  }, []);

  // Optimized fast upload
  const uploadToTemp = async (
    file: File,
    partId: string,
    fileCategory: 'CAD' | 'INI' | 'GCODE'
  ): Promise<FastTempFile | null> => {
    setUploading(true);
    
    try {
      console.log('⚡ [FastTempUpload] Fast upload starting:', file.name);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      // Simplified path structure for speed
      const timestamp = Date.now();
      const tempPath = `${user.id}/temp/${fileCategory}/${timestamp}-${file.name}`;
      
      // Direct upload without extra options for maximum speed
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(tempPath, file, {
          upsert: true
        });

      if (error) {
        console.error('❌ [FastTempUpload] Upload error:', error);
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      const tempFile: FastTempFile = {
        id: `temp-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        tempPath: data.path,
        file: file,
        category: fileCategory,
        partId: partId,
        uploadedAt: timestamp
      };

      tempFileIds.current.add(tempFile.id);
      setTempFiles(prev => [...prev, tempFile]);

      console.log('⚡ [FastTempUpload] Fast upload completed:', data.path);
      
      return tempFile;

    } catch (error: any) {
      console.error('❌ [FastTempUpload] Fast upload failed:', error);
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

  // Fast removal
  const removeTempFile = async (fileId: string) => {
    console.log('⚡ [FastTempUpload] Fast removing:', fileId);
    
    const tempFile = tempFiles.find(f => f.id === fileId);
    if (tempFile) {
      // Don't await - fire and forget for UI responsiveness
      supabase.storage
        .from('design-files')
        .remove([tempFile.tempPath])
        .catch(error => console.warn('⚠️ [FastTempUpload] Remove warning:', error));
    }
    
    // Immediate UI update
    tempFileIds.current.delete(fileId);
    setTempFiles(prev => prev.filter(f => f.id !== fileId));
    
    toast({
      title: "Datei entfernt",
      description: "Die Datei wurde entfernt.",
    });
  };

  // Optimized move operation
  const moveToFinal = async (
    tempFile: FastTempFile,
    finalPath: string
  ): Promise<string | null> => {
    try {
      console.log('⚡ [FastTempUpload] Fast move operation');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Benutzer nicht angemeldet');
      }

      const fullFinalPath = `${user.id}/${finalPath}`;
      
      // Download from temp
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('design-files')
        .download(tempFile.tempPath);

      if (downloadError) {
        throw new Error(`Download-Fehler: ${downloadError.message}`);
      }

      // Upload to final location
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(fullFinalPath, fileData, {
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload-Fehler: ${uploadError.message}`);
      }

      // Delete temp file (fire and forget)
      supabase.storage
        .from('design-files')
        .remove([tempFile.tempPath])
        .catch(error => console.warn('⚠️ [FastTempUpload] Temp cleanup warning:', error));

      // Immediate state update
      tempFileIds.current.delete(tempFile.id);
      setTempFiles(prev => prev.filter(f => f.id !== tempFile.id));

      console.log('⚡ [FastTempUpload] Fast move completed:', fullFinalPath);
      return uploadData.path;

    } catch (error: any) {
      console.error('❌ [FastTempUpload] Fast move failed:', error);
      throw error;
    }
  };

  const getTempFilesForPart = (partId: string): FastTempFile[] => {
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
