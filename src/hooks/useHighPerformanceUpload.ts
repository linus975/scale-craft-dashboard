
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
  
  // Cache user to avoid repeated auth calls
  const userCache = useRef<any>(null);

  const getCachedUser = useCallback(async () => {
    if (userCache.current) {
      return userCache.current;
    }
    
    const startTime = Date.now();
    const { data: { user }, error } = await supabase.auth.getUser();
    const authTime = Date.now() - startTime;
    console.log(`🔐 Auth check took: ${authTime}ms`);
    
    if (error || !user) throw new Error('User not authenticated');
    
    userCache.current = user;
    return user;
  }, []);

  const uploadFile = async (
    file: File, 
    folder: string = '',
    onProgress?: (progress: number, speed?: string, timeRemaining?: string) => void
  ): Promise<string> => {
    console.log(`🚀 DIRECT UPLOAD START: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    console.log(`📊 File details:`, {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });
    
    const overallStartTime = Date.now();
    
    // Step 1: Get user (should be cached after first call)
    const userStartTime = Date.now();
    const user = await getCachedUser();
    const userTime = Date.now() - userStartTime;
    console.log(`👤 User retrieval: ${userTime}ms`);
    
    // Step 2: Generate file path
    const pathStartTime = Date.now();
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;
    const pathTime = Date.now() - pathStartTime;
    console.log(`📁 Path generation: ${pathTime}ms, Path: ${filePath}`);

    try {
      // Step 3: Use DIRECT upload for better performance
      const directUploadStartTime = Date.now();
      console.log(`📤 Starting direct upload to Supabase Storage...`);
      
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      const directUploadTime = Date.now() - directUploadStartTime;
      const totalTime = Date.now() - overallStartTime;
      
      console.log(`⚡ Direct upload completed: ${directUploadTime}ms`);
      console.log(`🏁 TOTAL TIME: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
      
      if (error) {
        console.error(`❌ Direct upload error:`, error);
        throw error;
      }

      const speed = (file.size / 1024 / 1024 / (directUploadTime / 1000)).toFixed(1);
      console.log(`⚡ Average speed: ${speed} MB/s`);
      onProgress?.(100, `${speed} MB/s`, '0s');
      
      return data.path;

    } catch (error) {
      const totalTime = Date.now() - overallStartTime;
      console.error(`❌ Upload error after ${totalTime}ms:`, error);
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
    
    console.log(`🚀 Starting DIRECT upload of ${files.length} files`);
    
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

      // Upload files sequentially for better performance (avoid overloading Supabase)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${i}-${file.name}`;
        
        try {
          console.log(`\n📂 === UPLOADING FILE ${i + 1}/${files.length}: ${file.name} ===`);
          
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
          console.log(`✅ File ${i + 1} completed successfully`);
          
        } catch (error) {
          console.error(`❌ Error uploading file ${i + 1} (${file.name}):`, error);
          
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

      console.log(`\n🏁 UPLOAD SUMMARY: ${successful} successful, ${failed} failed`);

      if (successful > 0) {
        toast({
          title: "Upload erfolgreich!",
          description: `${successful} Datei(en) hochgeladen${failed > 0 ? `, ${failed} fehlgeschlagen` : ''}.`,
        });
      }

      return results;
    } finally {
      setUploading(false);
      // Clear progress after 3 seconds for better UX
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
