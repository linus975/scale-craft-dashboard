
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  partId?: string;
}

export const useUserStorageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const getFileCategory = (fileName: string): 'CAD' | 'INI' | 'GCODE' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
      case 'step':
      case 'stp':
      case 'iges':
      case 'igs':
      case 'dwg':
      case 'dxf':
      case 'stl':
        return 'CAD';
      case 'ini':
        return 'INI';
      case 'gcode':
      case 'g':
        return 'GCODE';
      default:
        return 'CAD';
    }
  };

  const uploadToTemporary = async (file: File, partId: string = 'main'): Promise<UploadedFile> => {
    setUploading(true);
    
    try {
      console.log('🔍 [UserStorageUpload] Starting upload process...');
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 [UserStorageUpload] Current user:', user?.id);
      
      if (!user) {
        console.error('❌ [UserStorageUpload] No authenticated user found');
        throw new Error('Benutzer nicht angemeldet');
      }

      const fileCategory = getFileCategory(file.name);
      const fileName = `${Date.now()}-${file.name}`;
      const tempPath = `${user.id}/temp/${partId}/${fileCategory}/${fileName}`;
      
      console.log('📤 [UserStorageUpload] Upload details:');
      console.log('  - File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      console.log('  - Category:', fileCategory);
      console.log('  - Part ID:', partId);
      console.log('  - Temp path:', tempPath);
      console.log('  - User ID:', user.id);

      // Check if user-storage bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ [UserStorageUpload] Error listing buckets:', bucketsError);
        throw new Error(`Bucket-Fehler: ${bucketsError.message}`);
      }

      const userStorageBucket = buckets?.find(bucket => bucket.id === 'user-storage');
      if (!userStorageBucket) {
        console.error('❌ [UserStorageUpload] user-storage bucket not found');
        console.log('📋 [UserStorageUpload] Available buckets:', buckets?.map(b => b.id));
        throw new Error('user-storage Bucket nicht gefunden');
      }

      console.log('✅ [UserStorageUpload] user-storage bucket found:', userStorageBucket.name);

      // Enhanced error handling for upload
      console.log('🚀 [UserStorageUpload] Starting file upload to:', tempPath);
      const { data, error } = await supabase.storage
        .from('user-storage')
        .upload(tempPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [UserStorageUpload] Upload error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
          cause: error.cause
        });
        
        // Check if it's a policy error
        if (error.message.includes('policy') || error.message.includes('RLS')) {
          console.error('🔐 [UserStorageUpload] RLS Policy error detected');
          
          // Test if we can list the user's folder
          const { data: testList, error: testError } = await supabase.storage
            .from('user-storage')
            .list(user.id, { limit: 1 });
            
          if (testError) {
            console.error('❌ [UserStorageUpload] Cannot list user folder:', testError);
          } else {
            console.log('✅ [UserStorageUpload] User folder is listable:', testList);
          }
        }
        
        throw new Error(`Upload-Fehler: ${error.message}`);
      }

      console.log('✅ [UserStorageUpload] File uploaded successfully:', data.path);

      // Verify upload by trying to get the file info
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from('user-storage')
        .list(user.id + '/temp/' + partId + '/' + fileCategory);
        
      if (infoError) {
        console.warn('⚠️ [UserStorageUpload] Could not verify upload:', infoError);
      } else {
        console.log('✅ [UserStorageUpload] Upload verified, files in folder:', fileInfo?.length);
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

      console.log('📋 [UserStorageUpload] Created file object:', uploadedFile);

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde in temporären ${fileCategory} Ordner gespeichert.`,
      });

      return uploadedFile;

    } catch (error: any) {
      console.error('❌ [UserStorageUpload] Complete upload error:', error);
      
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

  const moveToFinalLocation = async (tempFiles: UploadedFile[], designId: string) => {
    console.log('🚀 [UserStorageUpload] Starting moveToFinalLocation...');
    console.log('📁 [UserStorageUpload] Files to move:', tempFiles.length);
    console.log('🎯 [UserStorageUpload] Target design ID:', designId);
    
    if (!designId) {
      console.error('❌ [UserStorageUpload] No design ID provided for moveToFinalLocation');
      throw new Error('Design ID ist erforderlich zum Verschieben der Dateien');
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [UserStorageUpload] No authenticated user for move operation');
        throw new Error('Benutzer nicht angemeldet');
      }

      console.log('👤 [UserStorageUpload] Move operation user ID:', user.id);

      let movedCount = 0;
      let errorCount = 0;

      for (const [index, file] of tempFiles.entries()) {
        console.log(`🔄 [UserStorageUpload] Processing file ${index + 1}/${tempFiles.length}: ${file.name}`);
        
        try {
          const finalPath = `${user.id}/designs/${designId}/parts/${file.partId}/${file.fileCategory}/${file.originalName}`;
          console.log('  📍 Source path:', file.path);
          console.log('  📍 Target path:', finalPath);
          
          // Check if source file exists
          const { data: sourceList, error: sourceError } = await supabase.storage
            .from('user-storage')
            .list(file.path.substring(0, file.path.lastIndexOf('/')), { limit: 100 });
            
          if (sourceError) {
            console.error('  ❌ Error checking source file:', sourceError);
            throw new Error(`Source file check failed: ${sourceError.message}`);
          }
          
          const sourceFile = sourceList?.find(f => file.path.endsWith(f.name));
          if (!sourceFile) {
            console.error('  ❌ Source file not found in listing');
            throw new Error('Source file not found');
          }
          
          console.log('  ✅ Source file confirmed exists');
          
          // Download from temp location
          console.log('  📥 Downloading from temp location...');
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('user-storage')
            .download(file.path);

          if (downloadError) {
            console.error('  ❌ Download error:', downloadError);
            throw new Error(`Download failed: ${downloadError.message}`);
          }

          console.log('  ✅ Downloaded successfully, size:', fileData.size);

          // Upload to final location
          console.log('  📤 Uploading to final location...');
          const { error: uploadError } = await supabase.storage
            .from('user-storage')
            .upload(finalPath, fileData, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('  ❌ Upload to final location error:', uploadError);
            throw new Error(`Upload to final location failed: ${uploadError.message}`);
          }

          console.log('  ✅ Uploaded to final location successfully');

          // Delete temp file
          console.log('  🗑️ Cleaning up temp file...');
          const { error: deleteError } = await supabase.storage
            .from('user-storage')
            .remove([file.path]);

          if (deleteError) {
            console.warn('  ⚠️ Failed to delete temp file:', deleteError);
          } else {
            console.log('  ✅ Temp file cleaned up');
          }

          movedCount++;
          console.log(`  ✅ File ${index + 1} moved successfully`);

        } catch (fileError: any) {
          console.error(`  ❌ Error moving file ${file.name}:`, fileError);
          errorCount++;
        }
      }

      console.log(`📊 [UserStorageUpload] Move operation completed:`);
      console.log(`  ✅ Successfully moved: ${movedCount} files`);
      console.log(`  ❌ Failed to move: ${errorCount} files`);

      if (movedCount > 0) {
        toast({
          title: "Dateien verschoben",
          description: `${movedCount} von ${tempFiles.length} Dateien wurden erfolgreich verschoben.`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Warnung",
          description: `${errorCount} Dateien konnten nicht verschoben werden.`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('❌ [UserStorageUpload] Move operation failed:', error);
      toast({
        title: "Fehler beim Verschieben",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    uploading,
    uploadToTemporary,
    moveToFinalLocation
  };
};
