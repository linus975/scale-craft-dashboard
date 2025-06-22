
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  speed?: string;
  error?: string;
}

export const useOptimizedFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const { toast } = useToast();

  const uploadFile = async (
    file: File, 
    folder: string = '', 
    onProgress?: (progress: number) => void
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Simplified filename - just timestamp to avoid conflicts
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${timestamp}.${fileExt}`;
    
    // Optimized path structure
    const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

    console.log(`🚀 Starting optimized upload: ${file.name} -> ${filePath}`);
    
    const startTime = Date.now();
    
    // Upload with optimized settings
    const { data, error } = await supabase.storage
      .from('design-files')
      .upload(filePath, file, {
        cacheControl: '86400', // 24 hours cache
        upsert: false
      });

    if (error) throw error;

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const speed = (file.size / 1024 / 1024 / duration).toFixed(1);
    
    console.log(`✅ Upload completed in ${duration.toFixed(1)}s at ${speed} MB/s`);

    return data.path;
  };

  const uploadMultipleFiles = async (
    files: File[],
    folder: string = '',
    onGlobalProgress?: (progress: number) => void
  ) => {
    setUploading(true);
    const results: { file: File; path?: string; error?: string }[] = [];
    
    try {
      // Initialize progress tracking
      const progressMap: Record<string, UploadProgress> = {};
      files.forEach((file, index) => {
        const fileId = `${index}-${file.name}`;
        progressMap[fileId] = {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'pending'
        };
      });
      setUploadProgress(progressMap);

      // Upload files in parallel (max 3 concurrent uploads)
      const uploadPromises = files.map(async (file, index) => {
        const fileId = `${index}-${file.name}`;
        
        try {
          // Update status to uploading
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { ...prev[fileId], status: 'uploading' }
          }));

          const startTime = Date.now();
          const path = await uploadFile(file, folder, (progress) => {
            const speed = progress > 0 ? 
              `${((file.size * progress / 100) / 1024 / 1024 / ((Date.now() - startTime) / 1000)).toFixed(1)} MB/s` : 
              undefined;
            
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: { 
                ...prev[fileId], 
                progress, 
                speed 
              }
            }));
          });

          // Mark as completed
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { 
              ...prev[fileId], 
              status: 'completed', 
              progress: 100 
            }
          }));

          return { file, path };
        } catch (error) {
          console.error(`❌ Error uploading ${file.name}:`, error);
          
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { 
              ...prev[fileId], 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          }));

          return { file, error: error instanceof Error ? error.message : 'Upload failed' };
        }
      });

      // Process uploads with concurrency limit
      const chunkSize = 3;
      for (let i = 0; i < uploadPromises.length; i += chunkSize) {
        const chunk = uploadPromises.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(chunk);
        results.push(...chunkResults);
        
        // Update global progress
        if (onGlobalProgress) {
          const completedCount = Math.min(i + chunkSize, files.length);
          onGlobalProgress((completedCount / files.length) * 100);
        }
      }

      const successful = results.filter(r => r.path).length;
      const failed = results.filter(r => r.error).length;

      if (successful > 0) {
        toast({
          title: "Upload erfolgreich",
          description: `${successful} Datei(en) erfolgreich hochgeladen${failed > 0 ? `, ${failed} fehlgeschlagen` : ''}.`,
        });
      }

      if (failed > 0 && successful === 0) {
        toast({
          title: "Upload fehlgeschlagen",
          description: `${failed} Datei(en) konnten nicht hochgeladen werden.`,
          variant: "destructive",
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
