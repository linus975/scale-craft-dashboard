
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

export const useSimpleFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
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
        return 'CAD'; // Default fallback
    }
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
        return 'Fusion 360 File';
      case 'step':
      case 'stp':
        return 'STEP File';
      case 'iges':
      case 'igs':
        return 'IGES File';
      case 'stl':
        return 'STL File';
      case 'ini':
        return 'Settings File';
      case 'gcode':
      case 'g':
        return 'G-Code File';
      default:
        return 'Unknown File';
    }
  };

  const testStorageAccess = async (): Promise<boolean> => {
    try {
      console.log('🧪 [SimpleUpload] Testing storage access...');
      
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ [SimpleUpload] Auth error:', authError);
        return false;
      }
      if (!user) {
        console.error('❌ [SimpleUpload] User not authenticated');
        toast({
          title: "Authentifizierung erforderlich",
          description: "Bitte melden Sie sich an, um Dateien hochzuladen.",
          variant: "destructive",
        });
        return false;
      }
      console.log('✅ [SimpleUpload] User authenticated:', user.id);

      // Test 2: Check bucket access
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('❌ [SimpleUpload] Bucket list error:', bucketError);
        return false;
      }
      
      const designFilesBucket = buckets?.find(bucket => bucket.id === 'design-files');
      if (!designFilesBucket) {
        console.error('❌ [SimpleUpload] design-files bucket not found');
        toast({
          title: "Storage-Fehler",
          description: "Der design-files Bucket wurde nicht gefunden.",
          variant: "destructive",
        });
        return false;
      }
      console.log('✅ [SimpleUpload] design-files bucket found');

      // Test 3: Try to list user's folder
      const { data: userFiles, error: listError } = await supabase.storage
        .from('design-files')
        .list(user.id, { limit: 1 });

      if (listError) {
        console.log('⚠️ [SimpleUpload] User folder list error (might be empty):', listError);
      } else {
        console.log('✅ [SimpleUpload] User folder accessible, files:', userFiles?.length || 0);
      }

      return true;
    } catch (error) {
      console.error('❌ [SimpleUpload] Storage access test failed:', error);
      return false;
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    setUploading(true);
    
    try {
      console.log('🚀 [SimpleUpload] Starting upload process for:', file.name);
      
      // Test storage access first
      const hasAccess = await testStorageAccess();
      if (!hasAccess) {
        throw new Error('Storage access test failed');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const fileCategory = getFileCategory(file.name);
      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = `${user.id}/temp/${fileCategory}/${fileName}`;
      
      console.log('📤 [SimpleUpload] Upload details:');
      console.log('  - Original name:', file.name);
      console.log('  - Category:', fileCategory);
      console.log('  - Full path:', fullPath);
      console.log('  - File size:', file.size, 'bytes');
      console.log('  - File type:', file.type);

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ [SimpleUpload] Upload error:', error);
        console.error('❌ [SimpleUpload] Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error
        });
        throw error;
      }

      console.log('✅ [SimpleUpload] Upload successful:', data.path);

      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: getFileType(file.name),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        path: data.path,
        originalName: file.name,
        fileCategory: fileCategory
      };

      setUploadedFiles(prev => [...prev, newFile]);

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde erfolgreich im ${fileCategory} Ordner gespeichert.`,
      });

    } catch (error: any) {
      console.error('❌ [SimpleUpload] Upload failed:', error);
      
      let errorMessage = "Unbekannter Fehler beim Upload";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    console.log('🗑️ [SimpleUpload] Removing file with ID:', fileId);
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "Datei entfernt",
      description: "Die Datei wurde aus der Liste entfernt.",
    });
  };

  const clearAllFiles = () => {
    console.log('🧹 [SimpleUpload] Clearing all files');
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    uploading,
    uploadFile,
    removeFile,
    clearAllFiles,
    previewImage,
    testStorageAccess
  };
};
