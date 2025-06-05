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
      console.log('🔍 Starting to fetch designs...');
      
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.id, authError);
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }

      if (!user) {
        console.log('⚠️ No authenticated user found');
        setDesigns([]);
        setLoading(false);
        return;
      }

      console.log('📊 Fetching designs for user:', user.id);
      
      // Try to fetch designs
      const { data, error, count } = await supabase
        .from('designs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('📈 Query result:', { data, error, count });
      console.log('📋 Designs data:', data);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} designs`);
      setDesigns(data || []);
    } catch (error: any) {
      console.error('💥 Error in fetchDesigns:', error);
      toast({
        title: "Fehler beim Laden der Designs",
        description: error.message || "Unbekannter Fehler beim Laden der Designs",
        variant: "destructive",
      });
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const createDesign = async (designData: Omit<DesignInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      console.log('🔨 Creating design with data:', designData);

      // Clean the design data to match database schema
      const cleanDesignData = {
        name: designData.name,
        description: designData.description || null,
        category: designData.category,
        design_type: designData.design_type,
        ean_number: designData.ean_number || null,
        tracking_type: designData.tracking_type || null,
        cad_software: designData.cad_software || null,
        slicer: designData.slicer || null,
        sketch_name: designData.sketch_name || null,
        replacement_value: designData.replacement_value || null,
        cad_file_path: designData.cad_file_path || null,
        ini_file_path: designData.ini_file_path || null,
        gcode_file_path: designData.gcode_file_path || null,
        gcode: designData.gcode || null,
        preview_image_path: designData.preview_image_path || null,
        nozzle_diameter: designData.nozzle_diameter || null,
        material: designData.material || null,
        color: designData.color || null,
        machine: designData.machine || null,
        version: designData.version || 'v1.0',
        user_id: user.id
      };

      console.log('💾 Inserting clean design data:', cleanDesignData);

      const { data, error } = await supabase
        .from('designs')
        .insert(cleanDesignData)
        .select()
        .single();

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }

      console.log('✅ Design created successfully:', data);

      // Create EAN mapping if EAN number is provided
      if (data.ean_number && data.tracking_type) {
        try {
          // Try to create mapping, handle duplicates gracefully
          await createMapping({
            ean_number: data.ean_number,
            product_type: data.design_type as 'static' | 'personalized',
            design_id: data.id
          });
          
          console.log('✅ EAN mapping created successfully for design:', data.name);
        } catch (mappingError: any) {
          console.error('❌ Error creating EAN mapping:', mappingError);
          // Don't fail the entire operation if EAN mapping already exists
          if (!mappingError.message?.includes('duplicate key')) {
            toast({
              title: "Warnung",
              description: "Design wurde erstellt, aber EAN-Mapping konnte nicht gespeichert werden.",
              variant: "destructive",
            });
          }
        }
      }

      setDesigns(prev => [data, ...prev]);
      toast({
        title: "Design erfolgreich erstellt",
        description: `Das Design "${data.name}" wurde hinzugefügt.`,
      });

      return data;
    } catch (error: any) {
      console.error('💥 Error creating design:', error);
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
    console.log('🚀 useDesigns hook mounted, fetching designs...');
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
