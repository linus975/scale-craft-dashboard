
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStorageManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ensureUserFolders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [StorageManager] User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('🔧 [StorageManager] Ensuring user folder structure for:', user.id);

      // Check if design-files bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ [StorageManager] Error checking buckets:', bucketsError);
        throw new Error(`Bucket check failed: ${bucketsError.message}`);
      }

      const designFilesBucket = buckets?.find(b => b.id === 'design-files');
      if (!designFilesBucket) {
        console.error('❌ [StorageManager] design-files bucket not found');
        throw new Error('design-files bucket not found');
      }

      console.log('✅ [StorageManager] design-files bucket exists');

      // Create comprehensive folder structure
      const folders = [
        'temp-parts/main/CAD',
        'temp-parts/main/INI', 
        'temp-parts/main/GCODE',
        'temp-parts', // Base temp-parts folder
        'final-parts/CAD',
        'final-parts/INI',
        'final-parts/GCODE'
      ];
      
      for (const folder of folders) {
        const placeholderPath = `${user.id}/${folder}/.keep`;
        const placeholderContent = new Blob(['# Folder placeholder'], { type: 'text/plain' });
        
        console.log(`📁 [StorageManager] Creating/ensuring folder: ${user.id}/${folder}`);
        
        try {
          // Always upload the placeholder to ensure folder exists
          const { error: uploadError } = await supabase.storage
            .from('design-files')
            .upload(placeholderPath, placeholderContent, { 
              upsert: true,
              cacheControl: '3600'
            });

          if (uploadError) {
            console.error(`❌ [StorageManager] Error creating folder ${folder}:`, uploadError);
            // Don't throw here, continue with other folders
          } else {
            console.log(`✅ [StorageManager] Created/ensured folder: ${folder}`);
          }
        } catch (folderError) {
          console.error(`❌ [StorageManager] Exception creating folder ${folder}:`, folderError);
          // Continue with other folders
        }
      }

      // Verify folder structure was created
      console.log('🔍 [StorageManager] Verifying folder structure...');
      const { data: userFiles, error: listError } = await supabase.storage
        .from('design-files')
        .list(user.id, { limit: 100 });

      if (listError) {
        console.error('❌ [StorageManager] Error verifying folders:', listError);
        throw new Error(`Folder verification failed: ${listError.message}`);
      }

      console.log('📂 [StorageManager] User folder contents:', userFiles?.map(f => f.name));

      // Check for temp-parts specifically
      const tempPartsExists = userFiles?.some(f => f.name === 'temp-parts');
      if (!tempPartsExists) {
        console.warn('⚠️ [StorageManager] temp-parts folder not found after creation');
        
        // Try alternative approach - create temp-parts folder directly
        const tempFolderPath = `${user.id}/temp-parts/.keep`;
        const { error: tempError } = await supabase.storage
          .from('design-files')
          .upload(tempFolderPath, new Blob(['temp folder'], { type: 'text/plain' }), { upsert: true });
          
        if (tempError) {
          console.error('❌ [StorageManager] Failed to create temp-parts folder:', tempError);
        } else {
          console.log('✅ [StorageManager] temp-parts folder created successfully');
        }
      }

      console.log('✅ [StorageManager] User folder structure ensured');
      return true;

    } catch (error) {
      console.error('❌ [StorageManager] Error ensuring folders:', error);
      toast({
        title: "Fehler beim Erstellen der Ordnerstruktur",
        description: `Die Ordner konnten nicht erstellt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const listUserFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: files, error } = await supabase.storage
        .from('design-files')
        .list(user.id, { limit: 100 });

      if (error) throw error;
      return files || [];
    } catch (error) {
      console.error('❌ [StorageManager] Error listing files:', error);
      return [];
    }
  };

  const debugUserStorage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ [StorageManager] No user for debug');
        return;
      }

      console.log('🔍 [StorageManager] === STORAGE DEBUG INFO ===');
      console.log('👤 User ID:', user.id);
      
      // List all buckets
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log('📦 Available buckets:', buckets?.map(b => b.id));

      // List user's root folder
      const { data: userRoot, error: rootError } = await supabase.storage
        .from('design-files')
        .list(user.id);
        
      if (rootError) {
        console.error('❌ [StorageManager] Error listing user root:', rootError);
      } else {
        console.log('📁 User root contents:', userRoot?.map(f => f.name));
      }

      // List temp-parts if it exists
      const { data: tempParts, error: tempError } = await supabase.storage
        .from('design-files')
        .list(`${user.id}/temp-parts`);
        
      if (tempError) {
        console.log('ℹ️ [StorageManager] temp-parts folder does not exist yet:', tempError.message);
      } else {
        console.log('📂 temp-parts contents:', tempParts?.map(f => f.name));
      }

      console.log('🔍 [StorageManager] === END DEBUG INFO ===');
    } catch (error) {
      console.error('❌ [StorageManager] Debug error:', error);
    }
  };

  return {
    ensureUserFolders,
    listUserFiles,
    debugUserStorage,
    loading
  };
};
