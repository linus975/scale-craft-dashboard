
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type EanMapping = Database['public']['Tables']['product_ean_mapping']['Row'];
type EanMappingInsert = Database['public']['Tables']['product_ean_mapping']['Insert'];

export const useEanMapping = () => {
  const [mappings, setMappings] = useState<EanMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('product_ean_mapping')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMappings(data || []);
    } catch (error: any) {
      console.error('Error fetching EAN mappings:', error);
      toast({
        title: "Fehler beim Laden der EAN-Mappings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createMapping = async (mappingData: EanMappingInsert) => {
    try {
      const { data, error } = await supabase
        .from('product_ean_mapping')
        .insert(mappingData)
        .select()
        .single();

      if (error) throw error;

      setMappings(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      console.error('Error creating EAN mapping:', error);
      toast({
        title: "Fehler beim Erstellen des EAN-Mappings",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getProductTypeByEan = async (eanNumber: string): Promise<'static' | 'personalized' | null> => {
    try {
      const { data, error } = await supabase
        .from('product_ean_mapping')
        .select('product_type')
        .eq('ean_number', eanNumber)
        .maybeSingle();

      if (error) throw error;
      return data?.product_type as 'static' | 'personalized' | null;
    } catch (error: any) {
      console.error('Error fetching product type by EAN:', error);
      return null;
    }
  };

  const updateMapping = async (id: string, updates: Partial<EanMappingInsert>) => {
    try {
      const { data, error } = await supabase
        .from('product_ean_mapping')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMappings(prev => prev.map(mapping => 
        mapping.id === id ? data : mapping
      ));

      return data;
    } catch (error: any) {
      console.error('Error updating EAN mapping:', error);
      toast({
        title: "Fehler beim Aktualisieren des EAN-Mappings",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  return {
    mappings,
    loading,
    createMapping,
    getProductTypeByEan,
    updateMapping,
    refetch: fetchMappings
  };
};
