
import { supabase } from '@/integrations/supabase/client';

export const getProductTypeByEan = async (eanNumber: string): Promise<'static' | 'personalized' | null> => {
  try {
    const { data, error } = await supabase
      .from('product_ean_mapping')
      .select('product_type')
      .eq('ean_number', eanNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching product type by EAN:', error);
      return null;
    }

    if (!data) {
      // If no mapping exists, default to personalized for safety
      return 'personalized';
    }

    return data.product_type as 'static' | 'personalized';
  } catch (error) {
    console.error('Error in getProductTypeByEan:', error);
    return null;
  }
};
