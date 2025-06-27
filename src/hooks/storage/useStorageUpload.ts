
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getFileCategory } from '@/utils/fileCategories';
import { UploadedFile } from '@/types/fileUpload';

export const useStorageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadToTemporary = async (file: File, partId: string = 'main'): Promise<UploadedFile> => {
    setUploading(true);
    
    try {
      console.log('🔍 [StorageUpload] Starting upload process...');
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 [StorageUpload] Current user:', user?.id);
      
      if (!user) {
        console.error('❌ [StorageUpload] No authenticated user found');
        throw new Error('Benutzer nicht angemeldet');
      }

      const fileCategory = getFileCategory(file.name);
      const fileName = `${Date.now()}-${file.name}`;
      const tempPath = `${user.id}/temp-parts/${partId}/${fileCategory}/${fileName}`;
      
      console.log('📤 [StorageUpload] Upload details:');
      console.log('  - File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      console.log('  - Category:', fileCategory);
      console.log('  - Part ID:', partId);
      console.log('  - Temp path:', tempPath);
      console.log('  - User ID:', user.id);

      // Check if design-files bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ [StorageUpload] Error listing buckets:', bucketsError);
        throw new Error(`Bucket-Fehler: ${bucketsError.message}`);
      }

      const designFilesBucket = buckets?.find(bucket => bucket.id === 'design-files');
      if (!designFilesBucket) {
        console.error('❌ [StorageUpload] design-files bucket not found');
        console.log('📋 [StorageUpload] Available buckets:', buckets?.map(b => b.id));
        throw new Error('design-files Bucket nicht gefunden');
      }

      console.log('✅ [StorageUpload] design-files bucket found:', designFilesBucket.name);

      // Enhanced error handling for upload
      console.log('🚀 [StorageUpload] Starting file upload to:', tempPath);
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(tempPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [StorageUpload] Upload error details:', {
          message: error.message,
          name: error.name
        });
        
        // Check if it's a policy error
        if (error.message.includes('policy') || error.message.includes('RLS')) {
          console.error('🔐 [StorageUpload] RLS Policy error detected');
          
          // Test if we can list the user's folder
          const { data: testList, error: testError } = await supabase.storage
            .from('design-files')
            .list(user.id, { limit: 1 });
            
          if (testError) {
            console.error('❌ [StorageUpload] Cannot list user folder:', testError);
          } else {
            console.log('✅ [StorageUpload] User folder is listable:', testList);
          }
        }
        
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      console.log('✅ [StorageUpload] File uploaded successfully:', data.path);

      // Verify upload by trying to get the file info
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from('design-files')
        .list(user.id + '/temp-parts/' + partId + '/' + fileCategory);
        
      if (infoError) {
        console.warn('⚠️ [StorageUpload] Could not verify upload:', infoError);
      } else {
        console.log('✅ [StorageUpload] Upload verified, files in folder:', fileInfo?.length);
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        path: data.path,
        originalName: file.name,
        fileCategory: fileCategory,
        partId: partId
      };

      console.log('📋 [StorageUpload] Created file object:', uploadedFile);

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde in temporären ${fileCategory} Ordner gespeichert.`,
      });

      return uploadedFile;

    } catch (error: any) {
      console.error('❌ [StorageUpload] Complete upload error:', error);
      
      // Enhanced error reporting
      if (error.message.includes('policy') || error.message.includes('RLS')) {
        toast({
          title: "Berechtigung verweigert",
          description: "Keine Berechtigung zum Hochladen von Dateien. Bitte wenden Sie sich an den Administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadToTemporary
  };
};
