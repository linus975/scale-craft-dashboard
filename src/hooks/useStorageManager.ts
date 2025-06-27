
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
      if (!user) throw new Error('User not authenticated');

      console.log('🔧 [StorageManager] Ensuring user folder structure for:', user.id);

      // Create temp folder structure by uploading placeholder files
      const folders = ['temp/CAD', 'temp/INI', 'temp/GCODE'];
      
      for (const folder of folders) {
        const placeholderPath = `${user.id}/${folder}/.keep`;
        const placeholderContent = new Blob([''], { type: 'text/plain' });
        
        // Check if folder exists by trying to list it
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('design-files')
          .list(`${user.id}/${folder}`, { limit: 1 });

        if (listError || !existingFiles) {
          // Folder doesn't exist, create it with placeholder
          console.log(`📁 [StorageManager] Creating folder: ${folder}`);
          const { error: uploadError } = await supabase.storage
            .from('design-files')
            .upload(placeholderPath, placeholderContent, { upsert: true });

          if (uploadError) {
            console.error(`❌ [StorageManager] Error creating folder ${folder}:`, uploadError);
          } else {
            console.log(`✅ [StorageManager] Created folder: ${folder}`);
          }
        } else {
          console.log(`✅ [StorageManager] Folder already exists: ${folder}`);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ [StorageManager] Error ensuring folders:', error);
      toast({
        title: "Fehler beim Erstellen der Ordnerstruktur",
        description: "Die Ordner konnten nicht erstellt werden.",
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

  return {
    ensureUserFolders,
    listUserFiles,
    loading
  };
};
