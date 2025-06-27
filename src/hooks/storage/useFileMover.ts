
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/fileUpload';

export const useFileMover = () => {
  const { toast } = useToast();

  const moveToFinalLocation = async (tempFiles: UploadedFile[], designId: string) => {
    console.log('🚀 [FileMover] Starting moveToFinalLocation...');
    console.log('📁 [FileMover] Files to move:', tempFiles.length);
    console.log('🎯 [FileMover] Target design ID:', designId);
    
    if (!designId) {
      console.error('❌ [FileMover] No design ID provided for moveToFinalLocation');
      throw new Error('Design ID ist erforderlich zum Verschieben der Dateien');
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [FileMover] No authenticated user for move operation');
        throw new Error('Benutzer nicht angemeldet');
      }

      console.log('👤 [FileMover] Move operation user ID:', user.id);

      let movedCount = 0;
      let errorCount = 0;

      for (const [index, file] of tempFiles.entries()) {
        console.log(`🔄 [FileMover] Processing file ${index + 1}/${tempFiles.length}: ${file.name}`);
        
        try {
          const finalPath = `${user.id}/designs/${designId}/parts/${file.partId}/${file.fileCategory}/${file.originalName}`;
          console.log('  📍 Source path:', file.path);
          console.log('  📍 Target path:', finalPath);
          
          // Check if source file exists
          const { data: sourceList, error: sourceError } = await supabase.storage
            .from('design-files')
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
            .from('design-files')
            .download(file.path);

          if (downloadError) {
            console.error('  ❌ Download error:', downloadError);
            throw new Error(`Download failed: ${downloadError.message}`);
          }

          console.log('  ✅ Downloaded successfully, size:', fileData.size);

          // Upload to final location
          console.log('  📤 Uploading to final location...');
          const { error: uploadError } = await supabase.storage
            .from('design-files')
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
            .from('design-files')
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

      console.log(`📊 [FileMover] Move operation completed:`);
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
      console.error('❌ [FileMover] Move operation failed:', error);
      toast({
        title: "Fehler beim Verschieben",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    moveToFinalLocation
  };
};
