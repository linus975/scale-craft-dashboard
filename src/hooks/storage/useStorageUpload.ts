
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

      // Test connection to Supabase first
      console.log('🔗 [StorageUpload] Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ [StorageUpload] Supabase connection test failed:', testError);
        throw new Error(`Verbindung zu Supabase fehlgeschlagen: ${testError.message}`);
      }
      
      console.log('✅ [StorageUpload] Supabase connection OK');

      // Check if design-files bucket exists
      console.log('📋 [StorageUpload] Checking available buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ [StorageUpload] Error listing buckets:', bucketsError);
        throw new Error(`Bucket-Fehler: ${bucketsError.message}`);
      }

      console.log('📂 [StorageUpload] Available buckets:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));

      const designFilesBucket = buckets?.find(bucket => bucket.id === 'design-files');
      if (!designFilesBucket) {
        console.error('❌ [StorageUpload] design-files bucket not found');
        console.log('📋 [StorageUpload] Available buckets:', buckets?.map(b => b.id));
        throw new Error('design-files Bucket nicht gefunden');
      }

      console.log('✅ [StorageUpload] design-files bucket found:', designFilesBucket.name);

      // Test if we can access the user's folder
      console.log('🗂️ [StorageUpload] Testing user folder access...');
      const { data: userFolderTest, error: userFolderError } = await supabase.storage
        .from('design-files')
        .list(user.id, { limit: 1 });

      if (userFolderError) {
        console.error('❌ [StorageUpload] Cannot access user folder:', userFolderError);
        console.log('🔧 [StorageUpload] Attempting to create user folder structure...');
        
        // Try to create the user folder by uploading a placeholder file
        const placeholderPath = `${user.id}/.keep`;
        const placeholderContent = new Blob([''], { type: 'text/plain' });
        
        const { error: placeholderError } = await supabase.storage
          .from('design-files')
          .upload(placeholderPath, placeholderContent, { upsert: true });
          
        if (placeholderError) {
          console.error('❌ [StorageUpload] Cannot create user folder:', placeholderError);
          throw new Error(`Benutzerordner kann nicht erstellt werden: ${placeholderError.message}`);
        }
        
        console.log('✅ [StorageUpload] User folder created successfully');
      } else {
        console.log('✅ [StorageUpload] User folder is accessible:', userFolderTest?.length, 'items');
      }

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
          name: error.name,
          cause: error.cause
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
            throw new Error(`Berechtigung verweigert: ${testError.message}`);
          } else {
            console.log('✅ [StorageUpload] User folder is listable:', testList);
          }
        }
        
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      console.log('✅ [StorageUpload] File uploaded successfully:', data.path);

      // Verify upload by trying to get the file info
      const folderPath = `${user.id}/temp-parts/${partId}/${fileCategory}`;
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from('design-files')
        .list(folderPath);
        
      if (infoError) {
        console.warn('⚠️ [StorageUpload] Could not verify upload:', infoError);
      } else {
        console.log('✅ [StorageUpload] Upload verified, files in folder:', fileInfo?.length);
        const uploadedFileInfo = fileInfo?.find(f => f.name === fileName);
        if (uploadedFileInfo) {
          console.log('✅ [StorageUpload] File found in storage:', uploadedFileInfo);
        } else {
          console.warn('⚠️ [StorageUpload] File not found in verification check');
        }
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
      } else if (error.message.includes('Bucket')) {
        toast({
          title: "Storage-Konfiguration fehlt",
          description: "Der Speicher-Bucket ist nicht konfiguriert. Bitte wenden Sie sich an den Administrator.",
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
