import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { useEanMapping } from './useEanMapping';

type Design = Database['public']['Tables']['designs']['Row'];
type DesignInsert = Database['public']['Tables']['designs']['Insert'];
type DesignUpdate = Database['public']['Tables']['designs']['Update'];

export const useDesigns = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { createMapping } = useEanMapping();

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error: any) {
      console.error('Error fetching designs:', error);
      toast({
        title: "Fehler beim Laden der Designs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDesign = async (designData: Omit<DesignInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      const { data, error } = await supabase
        .from('designs')
        .insert({ ...designData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Create EAN mapping if EAN number is provided
      if (data.ean_number) {
        try {
          await createMapping({
            ean_number: data.ean_number,
            product_type: data.design_type as 'static' | 'personalized',
            design_id: data.id
          });
          
          console.log('EAN mapping created successfully for design:', data.name);
        } catch (mappingError) {
          console.error('Error creating EAN mapping:', mappingError);
          // Don't fail the design creation if EAN mapping fails
          toast({
            title: "Warnung",
            description: "Design wurde erstellt, aber EAN-Mapping konnte nicht gespeichert werden.",
            variant: "destructive",
          });
        }
      }

      setDesigns(prev => [data, ...prev]);
      toast({
        title: "Design erfolgreich erstellt",
        description: `Das Design "${data.name}" wurde hinzugefügt.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating design:', error);
      toast({
        title: "Fehler beim Erstellen des Designs",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDesign = async (id: string, designData: DesignUpdate) => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .update({ ...designData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDesigns(prev => prev.map(design => 
        design.id === id ? data : design
      ));

      toast({
        title: "Design aktualisiert",
        description: `Das Design "${data.name}" wurde erfolgreich aktualisiert.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error updating design:', error);
      toast({
        title: "Fehler beim Aktualisieren des Designs",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDesign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDesigns(prev => prev.filter(design => design.id !== id));
      toast({
        title: "Design gelöscht",
        description: "Das Design wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      console.error('Error deleting design:', error);
      toast({
        title: "Fehler beim Löschen des Designs",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  return {
    designs,
    loading,
    createDesign,
    updateDesign,
    deleteDesign,
    refetch: fetchDesigns
  };
};
