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
        console.log('🔧 [StorageFolderManager] temp-parts folder might not exist yet');
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

      const folderPath = `${user.id}/temp-parts/${partName}`;
      
      // Try to create a placeholder file to ensure folder exists
      const placeholderContent = new Blob(['# Placeholder file to create folder structure'], { type: 'text/plain' });
      
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(`${folderPath}/.keep`, placeholderContent, {
          cacheControl: '3600',
          upsert: true
        });

      if (error && !error.message.includes('already exists')) {
        console.error('❌ [StorageFolderManager] Error creating temp-parts folder:', error);
        return false;
      }

      console.log(`✅ [StorageFolderManager] Ensured temp-parts folder exists for part: ${partName}`);
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

  return {
    folders,
    loading,
    checkStorageStructure,
    ensureTempPartsFolder,
    cleanupEmptyFolders
  };
};
