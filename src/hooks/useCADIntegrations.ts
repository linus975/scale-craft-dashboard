
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CADIntegration {
  id: string;
  user_id: string;
  program_type: string | null;
  name: string | null;
  client_id: string;
  client_secret?: string;
  status: string;
  token_expires_in?: number;
  token_type?: string;
  refresh_token?: string;
  access_token?: string;
  created_at: string;
  updated_at: string;
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
        title: "Error loading CAD integrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (programType: string) => {
    if (programType === 'fusion360') {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to connect CAD programs.",
          variant: "destructive",
        });
        return;
      }

      const authUrl = `https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=88t4YWH9qN3JhuCJT0vdELQqarJwrQYxe4D87ZMXfPVKzOPy&redirect_uri=https://n8n.melemeng.com/webhook/fusion-callback/&scope=data:create%20data:read%20data:write&state=${user.id}`;
      window.open(authUrl, '_blank');
    } else if (programType === 'solidworks') {
      // SolidWorks authentication URL could be added here later
      toast({
        title: "SolidWorks Integration",
        description: "SolidWorks integration will be available soon.",
      });
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    handleConnect,
    refetch: fetchIntegrations
  };
};
