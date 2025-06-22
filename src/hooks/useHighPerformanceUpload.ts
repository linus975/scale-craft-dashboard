
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
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('User not authenticated');
    
    userCache.current = user;
    return user;
  }, []);

  const uploadFile = async (
    file: File, 
    folder: string = '',
    onProgress?: (progress: number, speed?: string, timeRemaining?: string) => void
  ): Promise<string> => {
    console.log(`🚀 FAST UPLOAD START: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    
    const startTime = Date.now();
    const user = await getCachedUser();
    
    // Optimized filename - no complex logic
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

    console.log(`📁 Upload path: ${filePath}`);

    try {
      // Create a custom XMLHttpRequest for real progress tracking
      const formData = new FormData();
      formData.append('file', file);

      // Get upload URL from Supabase
      const { data: urlData, error: urlError } = await supabase.storage
        .from('design-files')
        .createSignedUploadUrl(filePath);

      if (urlError) {
        console.log('🔄 Fallback to direct upload method');
        
        // Direct upload with optimized settings
        const { data, error } = await supabase.storage
          .from('design-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const speed = (file.size / 1024 / 1024 / duration).toFixed(1);
        
        console.log(`✅ Direct upload completed in ${duration.toFixed(1)}s at ${speed} MB/s`);
        onProgress?.(100, `${speed} MB/s`, '0s');
        
        return data.path;
      }

      // Use signed URL for faster upload with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = (e.loaded / 1024 / 1024 / elapsed).toFixed(1);
            const remaining = ((e.total - e.loaded) / (e.loaded / elapsed) / 1000).toFixed(0);
            
            console.log(`📤 Upload progress: ${progress.toFixed(1)}% at ${speed} MB/s`);
            onProgress?.(progress, `${speed} MB/s`, `${remaining}s`);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            const speed = (file.size / 1024 / 1024 / duration).toFixed(1);
            
            console.log(`✅ Signed URL upload completed in ${duration.toFixed(1)}s at ${speed} MB/s`);
            onProgress?.(100, `${speed} MB/s`, '0s');
            resolve(filePath);
          } else {
            console.error('❌ Upload failed with status:', xhr.status);
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('❌ Upload error');
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', urlData.signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
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
    
    try {
      console.log(`🚀 Starting parallel upload of ${files.length} files`);
      
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

      // Upload files in parallel (max 3 concurrent for optimal performance)
      const uploadPromises = files.map(async (file, index) => {
        const fileId = `${index}-${file.name}`;
        
        try {
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

      // Process uploads with concurrency limit (3 at a time)
      const chunkSize = 3;
      for (let i = 0; i < uploadPromises.length; i += chunkSize) {
        const chunk = uploadPromises.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(chunk);
        results.push(...chunkResults);
        
        if (onGlobalProgress) {
          const completedCount = Math.min(i + chunkSize, files.length);
          onGlobalProgress((completedCount / files.length) * 100);
        }
      }

      const successful = results.filter(r => r.path).length;
      const failed = results.filter(r => r.error).length;

      if (successful > 0) {
        toast({
          title: "Blitzschneller Upload!",
          description: `${successful} Datei(en) in Rekordzeit hochgeladen${failed > 0 ? `, ${failed} fehlgeschlagen` : ''}.`,
        });
      }

      return results;
    } finally {
      setUploading(false);
      // Clear progress after 2 seconds for better UX
      setTimeout(() => setUploadProgress({}), 2000);
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
