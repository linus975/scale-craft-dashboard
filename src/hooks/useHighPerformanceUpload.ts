
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
    console.log(`🚀 UPLOAD START: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
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
      // Step 3: Try to create signed upload URL first
      const signedUrlStartTime = Date.now();
      console.log(`🔗 Trying signed URL upload...`);
      
      const { data: urlData, error: urlError } = await supabase.storage
        .from('design-files')
        .createSignedUploadUrl(filePath);
      
      const signedUrlTime = Date.now() - signedUrlStartTime;
      console.log(`🔗 Signed URL creation: ${signedUrlTime}ms`);
      
      if (urlError) {
        console.log(`❌ Signed URL failed: ${urlError.message}`);
        console.log(`🔄 Falling back to direct upload...`);
        
        // Fallback to direct upload
        const directUploadStartTime = Date.now();
        
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

        onProgress?.(100, `${((file.size / 1024 / 1024) / (directUploadTime / 1000)).toFixed(1)} MB/s`, '0s');
        return data.path;
      }

      // Step 4: Use signed URL with XMLHttpRequest for real progress
      console.log(`🔗 Using signed URL: ${urlData.signedUrl.substring(0, 100)}...`);
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const uploadStartTime = Date.now();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            const elapsed = (Date.now() - uploadStartTime) / 1000;
            const speed = elapsed > 0 ? (e.loaded / 1024 / 1024 / elapsed).toFixed(1) : '0';
            const remaining = elapsed > 0 && e.loaded > 0 ? 
              ((e.total - e.loaded) / (e.loaded / elapsed) / 1000).toFixed(0) : '0';
            
            console.log(`📤 Progress: ${progress.toFixed(1)}% (${(e.loaded/1024/1024).toFixed(1)}MB/${(e.total/1024/1024).toFixed(1)}MB) at ${speed} MB/s`);
            onProgress?.(progress, `${speed} MB/s`, `${remaining}s`);
          }
        });

        xhr.addEventListener('load', () => {
          const uploadTime = Date.now() - uploadStartTime;
          const totalTime = Date.now() - overallStartTime;
          
          if (xhr.status >= 200 && xhr.status < 300) {
            const speed = (file.size / 1024 / 1024 / (uploadTime / 1000)).toFixed(1);
            console.log(`✅ Signed URL upload completed: ${uploadTime}ms`);
            console.log(`🏁 TOTAL TIME: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
            console.log(`⚡ Average speed: ${speed} MB/s`);
            
            onProgress?.(100, `${speed} MB/s`, '0s');
            resolve(filePath);
          } else {
            console.error(`❌ Upload failed with status: ${xhr.status} ${xhr.statusText}`);
            console.log(`❌ Response:`, xhr.responseText);
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', (event) => {
          const totalTime = Date.now() - overallStartTime;
          console.error(`❌ Upload error after ${totalTime}ms:`, event);
          reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('timeout', () => {
          const totalTime = Date.now() - overallStartTime;
          console.error(`⏰ Upload timeout after ${totalTime}ms`);
          reject(new Error('Upload timed out'));
        });

        // Set a reasonable timeout (30 seconds)
        xhr.timeout = 30000;
        
        const xhrStartTime = Date.now();
        xhr.open('PUT', urlData.signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        
        console.log(`🚀 Starting XMLHttpRequest upload...`);
        xhr.send(file);
        
        const xhrSetupTime = Date.now() - xhrStartTime;
        console.log(`⚙️ XHR setup: ${xhrSetupTime}ms`);
      });

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

      // Upload files sequentially for better debugging (can be made parallel later)
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
