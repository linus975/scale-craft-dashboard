
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = () => {
  const getFileUrl = (filePath: string): string => {
    if (!filePath) return '';
    
    const { data } = supabase.storage
      .from('design-files')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    getFileUrl
  };
};
