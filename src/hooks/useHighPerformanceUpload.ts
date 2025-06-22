import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  speed?: string;
  bytesUploaded?: number;
  totalBytes?: number;
  timeRemaining?: string;
  error?: string;
}

// Chunk size: 1MB for better performance
const CHUNK_SIZE = 1024 * 1024;
const MAX_CONCURRENT_CHUNKS = 3;

export const useHighPerformanceUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const { toast } = useToast();
  
  // Cache auth user to avoid repeated calls
  const [cachedUser, setCachedUser] = useState<any>(null);
  
  const getAuthenticatedUser = async () => {
    if (cachedUser) return cachedUser;
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Authentication failed');
    
    setCachedUser(user);
    return user;
  };

  const uploadChunk = async (
    chunk: Blob,
    filePath: string,
    chunkIndex: number,
    totalChunks: number
  ): Promise<void> => {
    const chunkPath = totalChunks > 1 ? `${filePath}.chunk.${chunkIndex}` : filePath;
    
    const { error } = await supabase.storage
      .from('design-files')
      .upload(chunkPath, chunk, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
  };

  const combineChunks = async (filePath: string, totalChunks: number): Promise<void> => {
    if (totalChunks === 1) return;
    
    // For now, we'll use single upload since Supabase doesn't support chunk combining
    // This is a placeholder for future chunk combination logic
    console.log(`Would combine ${totalChunks} chunks for ${filePath}`);
  };

  const uploadFileWithChunks = async (
    file: File,
    filePath: string,
    onProgress?: (progress: number, speed?: string, timeRemaining?: string) => void
  ): Promise<void> => {
    const fileSize = file.size;
    const shouldChunk = fileSize > CHUNK_SIZE;
    
    if (!shouldChunk) {
      // Direct upload for small files
      const { error } = await supabase.storage
        .from('design-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      onProgress?.(100, undefined, '0s');
      return;
    }

    // For large files, we'll still use direct upload for now
    // Chunked upload would require custom backend logic
    console.log(`🔧 Large file detected (${(fileSize / 1024 / 1024).toFixed(1)}MB), using optimized direct upload`);
    
    const startTime = Date.now();
    let lastProgressTime = startTime;
    let lastBytesLoaded = 0;

    const { error } = await supabase.storage
      .from('design-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const totalTime = Date.now() - startTime;
    const speed = (fileSize / 1024 / 1024 / (totalTime / 1000)).toFixed(1);
    onProgress?.(100, `${speed} MB/s`, '0s');
  };

  const uploadFile = async (
    file: File, 
    folder: string = '',
    onProgress?: (progress: number, speed?: string, timeRemaining?: string) => void
  ): Promise<string> => {
    const startTime = Date.now();
    console.log(`🚀 OPTIMIZED UPLOAD START: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    
    try {
      // Get user with caching
      const user = await getAuthenticatedUser();
      console.log(`👤 Auth check: ${Date.now() - startTime}ms`);
      
      // Generate file path with original filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      
      // Use specific folder structure for gcode files
      let filePath: string;
      if (folder === 'gcode') {
        filePath = `${user.id}/gcode-files/${fileName}`;
      } else {
        filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;
      }
      
      console.log(`📁 Uploading to: ${filePath}`);
      
      // Use optimized upload
      await uploadFileWithChunks(file, filePath, onProgress);
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Upload completed in ${totalTime}ms`);
      
      return filePath;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ Upload failed after ${totalTime}ms:`, error);
      throw error;
    }
  };

  const uploadMultipleFiles = async (
    files: File[],
    folder: string = '',
    onGlobalProgress?: (progress: number) => void
  ) => {
    setUploading(true);
    const results: { file: File; path?: string; error?: string }[] = [];
    
    console.log(`🚀 Starting optimized batch upload of ${files.length} files`);
    
    try {
      // Initialize progress tracking
      const progressMap: Record<string, UploadProgress> = {};
      files.forEach((file, index) => {
        const fileId = `${index}-${file.name}`;
        progressMap[fileId] = {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'pending',
          totalBytes: file.size,
          bytesUploaded: 0
        };
      });
      setUploadProgress(progressMap);

      // Process files with limited concurrency
      const batchSize = Math.min(MAX_CONCURRENT_CHUNKS, files.length);
      
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (file, batchIndex) => {
          const globalIndex = i + batchIndex;
          const fileId = `${globalIndex}-${file.name}`;
          
          try {
            console.log(`📂 Processing file ${globalIndex + 1}/${files.length}: ${file.name}`);
            
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: { ...prev[fileId], status: 'uploading' }
            }));

            const path = await uploadFile(file, folder, (progress, speed, timeRemaining) => {
              setUploadProgress(prev => ({
                ...prev,
                [fileId]: { 
                  ...prev[fileId], 
                  progress,
                  speed,
                  timeRemaining,
                  bytesUploaded: Math.round((file.size * progress) / 100)
                }
              }));
            });

            setUploadProgress(prev => ({
              ...prev,
              [fileId]: { 
                ...prev[fileId], 
                status: 'completed', 
                progress: 100,
                speed: undefined,
                timeRemaining: '0s'
              }
            }));

            results.push({ file, path });
            console.log(`✅ File ${globalIndex + 1} completed`);
            
          } catch (error) {
            console.error(`❌ Error uploading file ${globalIndex + 1}:`, error);
            
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: { 
                ...prev[fileId], 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            }));

            results.push({ file, error: error instanceof Error ? error.message : 'Upload failed' });
          }
        }));
        
        if (onGlobalProgress) {
          onGlobalProgress(((i + batchSize) / files.length) * 100);
        }
      }

      const successful = results.filter(r => r.path).length;
      const failed = results.filter(r => r.error).length;

      console.log(`🏁 Batch upload complete: ${successful} successful, ${failed} failed`);

      if (successful > 0) {
        toast({
          title: "Upload erfolgreich!",
          description: `${successful} Datei(en) hochgeladen${failed > 0 ? `, ${failed} fehlgeschlagen` : ''}.`,
        });
      }

      return results;
    } finally {
      setUploading(false);
      // Clear progress after 3 seconds
      setTimeout(() => setUploadProgress({}), 3000);
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage
      .from('design-files')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const deleteFile = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('design-files')
        .remove([path]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: "Fehler beim Löschen der Datei",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    getFileUrl,
    deleteFile,
    uploading,
    uploadProgress
  };
};
