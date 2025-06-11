
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CADIntegration {
  id: string;
  user_id: string;
  program_type: string;
  name: string;
  client_id: string;
  client_secret?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CADIntegrationInsert {
  program_type: string;
  name: string;
  client_id: string;
  client_secret: string;
}

export const useCADIntegrations = () => {
  const [integrations, setIntegrations] = useState<CADIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('cad_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      console.error('Error fetching CAD integrations:', error);
      toast({
        title: "Fehler beim Laden der CAD-Integrationen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (integrationData: CADIntegrationInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Benutzer nicht angemeldet');

      const { data, error } = await supabase
        .from('cad_integrations')
        .insert({
          ...integrationData,
          user_id: user.id,
          status: 'connected'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchIntegrations();
      
      toast({
        title: "CAD-Integration erfolgreich erstellt",
        description: `${data.name} wurde erfolgreich verbunden.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating CAD integration:', error);
      toast({
        title: "Fehler beim Erstellen der CAD-Integration",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    createIntegration,
    refetch: fetchIntegrations
  };
};
