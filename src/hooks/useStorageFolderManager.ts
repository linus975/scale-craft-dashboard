
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStorageFolderManager = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkStorageStructure = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [StorageFolderManager] User not authenticated');
        return;
      }

      console.log('🔍 [StorageFolderManager] Checking storage structure for user:', user.id);

      // Check if design-files bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ [StorageFolderManager] Error listing buckets:', bucketsError);
        return;
      }

      const designFilesBucket = buckets?.find(bucket => bucket.id === 'design-files');
      if (!designFilesBucket) {
        console.error('❌ [StorageFolderManager] design-files bucket not found');
        toast({
          title: "Storage-Fehler",
          description: "Der design-files Bucket wurde nicht gefunden.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ [StorageFolderManager] design-files bucket exists:', designFilesBucket.name);

      // Check main user folder
      const { data: userFiles, error: userError } = await supabase.storage
        .from('design-files')
        .list(user.id, { limit: 100 });

      if (userError) {
        console.error('❌ [StorageFolderManager] Error checking user folder:', userError);
      } else {
        console.log('📁 [StorageFolderManager] User folder contents:', userFiles?.map(f => f.name) || []);
      }

      // Check temp-parts folder specifically
      const tempPartsPath = `${user.id}/temp-parts`;
      const { data: tempPartsFiles, error: tempPartsError } = await supabase.storage
        .from('design-files')
        .list(tempPartsPath, { limit: 100 });

      if (tempPartsError) {
        console.error('❌ [StorageFolderManager] Error checking temp-parts folder:', tempPartsError);
        console.log('🔧 [StorageFolderManager] temp-parts folder might not exist yet, will be created on first upload');
        setFolders([]);
      } else {
        console.log('📂 [StorageFolderManager] temp-parts folder contents:', tempPartsFiles?.map(f => f.name) || []);
        setFolders(tempPartsFiles?.map(f => f.name) || []);
      }

      // List all folders in user directory
      const allFolders = userFiles?.filter(file => file.name && !file.name.includes('.')) || [];
      console.log('📋 [StorageFolderManager] All user folders:', allFolders.map(f => f.name));

    } catch (error) {
      console.error('❌ [StorageFolderManager] Unexpected error:', error);
      toast({
        title: "Fehler beim Überprüfen der Ordnerstruktur",
        description: "Die Storage-Ordner konnten nicht überprüft werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureTempPartsFolder = async (partName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log(`🔧 [StorageFolderManager] Ensuring temp-parts folder exists for part: ${partName}`);
      
      // FIXED: Create the correct folder path without placeholder file
      // The folder will be created automatically when we upload the first file
      const folderPath = `${user.id}/temp-parts/${partName}`;
      console.log(`📂 [StorageFolderManager] Target folder path: ${folderPath}`);
      
      // Test if we can access the folder by trying to list it
      const { data, error } = await supabase.storage
        .from('design-files')
        .list(folderPath, { limit: 1 });

      if (error && !error.message.includes('The resource was not found')) {
        console.error('❌ [StorageFolderManager] Error checking temp-parts folder:', error);
        return false;
      }

      console.log(`✅ [StorageFolderManager] Temp-parts folder path ready for part: ${partName}`);
      return true;
    } catch (error) {
      console.error('❌ [StorageFolderManager] Error ensuring temp-parts folder:', error);
      return false;
    }
  };

  const cleanupEmptyFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tempPartsPath = `${user.id}/temp-parts`;
      const { data: partFolders, error } = await supabase.storage
        .from('design-files')
        .list(tempPartsPath, { limit: 100 });

      if (error || !partFolders) return;

      for (const folder of partFolders) {
        const folderPath = `${tempPartsPath}/${folder.name}`;
        const { data: folderContents } = await supabase.storage
          .from('design-files')
          .list(folderPath, { limit: 100 });

        // If folder only contains .keep file or is empty, it's considered empty
        const hasActualFiles = folderContents?.some(file => file.name !== '.keep') || false;
        
        if (!hasActualFiles) {
          console.log(`🧹 [StorageFolderManager] Cleaning up empty folder: ${folder.name}`);
          // Remove .keep file if it exists
          await supabase.storage
            .from('design-files')
            .remove([`${folderPath}/.keep`]);
        }
      }
    } catch (error) {
      console.error('❌ [StorageFolderManager] Error during cleanup:', error);
    }
  };

  const testStorageAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [StorageFolderManager] User not authenticated for test');
        toast({
          title: "Authentifizierung erforderlich",
          description: "Bitte melden Sie sich an, um auf den Storage zuzugreifen.",
          variant: "destructive",
        });
        return false;
      }

      console.log('🧪 [StorageFolderManager] Testing storage access for user:', user.id);

      // Test if we can list the root of design-files bucket
      const { data, error } = await supabase.storage
        .from('design-files')
        .list('', { limit: 1 });

      if (error) {
        console.error('❌ [StorageFolderManager] Storage access test failed:', error);
        toast({
          title: "Storage-Zugriff fehlgeschlagen",
          description: `Kann nicht auf design-files bucket zugreifen: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ [StorageFolderManager] Storage access test successful');
      
      // Test upload to user's temp area
      const testContent = new Blob(['test'], { type: 'text/plain' });
      const testPath = `${user.id}/test-upload-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(testPath, testContent);

      if (uploadError) {
        console.error('❌ [StorageFolderManager] Test upload failed:', uploadError);
        toast({
          title: "Upload-Test fehlgeschlagen",
          description: `Kann keine Dateien hochladen: ${uploadError.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Clean up test file
      await supabase.storage
        .from('design-files')
        .remove([testPath]);

      console.log('✅ [StorageFolderManager] Upload test successful');
      toast({
        title: "Storage-Test erfolgreich",
        description: "Zugriff und Upload-Funktionalität sind verfügbar.",
      });
      return true;
    } catch (error) {
      console.error('❌ [StorageFolderManager] Storage test error:', error);
      toast({
        title: "Storage-Test fehlgeschlagen",
        description: "Unerwarteter Fehler beim Testen des Storage-Zugriffs.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    folders,
    loading,
    checkStorageStructure,
    ensureTempPartsFolder,
    cleanupEmptyFolders,
    testStorageAccess
  };
};
