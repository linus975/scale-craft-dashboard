
import { useState, useCallback, useRef } from 'react';
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

export const useHighPerformanceUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const { toast } = useToast();

  const uploadFile = async (
    file: File, 
    folder: string = '',
    onProgress?: (progress: number, speed?: string, timeRemaining?: string) => void
  ): Promise<string> => {
    console.log(`🚀 SUPER SIMPLE UPLOAD: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    
    const startTime = Date.now();
    
    try {
      // Get user - no caching, just direct call
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Authentication failed');
      
      // Simple file path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;
      
      console.log(`📤 Direct upload to: ${filePath}`);
      
      // Direct upload - no signed URLs, no XMLHttpRequest, just basic Supabase
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`❌ Upload error:`, error);
        throw error;
      }

      const totalTime = Date.now() - startTime;
      const speed = (file.size / 1024 / 1024 / (totalTime / 1000)).toFixed(1);
      
      console.log(`✅ Upload completed in ${totalTime}ms (${speed} MB/s)`);
      onProgress?.(100, `${speed} MB/s`, '0s');
      
      return data.path;

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
    
    console.log(`🚀 Starting upload of ${files.length} files`);
    
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

      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${i}-${file.name}`;
        
        try {
          console.log(`📂 Uploading file ${i + 1}/${files.length}: ${file.name}`);
          
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
          console.log(`✅ File ${i + 1} completed`);
          
        } catch (error) {
          console.error(`❌ Error uploading file ${i + 1}:`, error);
          
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
        
        if (onGlobalProgress) {
          onGlobalProgress(((i + 1) / files.length) * 100);
        }
      }

      const successful = results.filter(r => r.path).length;
      const failed = results.filter(r => r.error).length;

      console.log(`🏁 Upload summary: ${successful} successful, ${failed} failed`);

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
