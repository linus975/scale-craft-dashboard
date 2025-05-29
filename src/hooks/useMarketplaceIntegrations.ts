
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type MarketplaceIntegration = Database['public']['Tables']['marketplace_integrations']['Row'];
type MarketplaceIntegrationInsert = Database['public']['Tables']['marketplace_integrations']['Insert'];
type MarketplaceIntegrationUpdate = Database['public']['Tables']['marketplace_integrations']['Update'];

export const useMarketplaceIntegrations = () => {
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      console.error('Error fetching marketplace integrations:', error);
      toast({
        title: "Error loading integrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (integrationData: Omit<MarketplaceIntegrationInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      const { data, error } = await supabase
        .from('marketplace_integrations')
        .insert({ ...integrationData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setIntegrations(prev => [data, ...prev]);
      toast({
        title: "Integration created successfully",
        description: `${data.name} has been successfully connected.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error creating integration",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateIntegration = async (id: string, integrationData: MarketplaceIntegrationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .update({ ...integrationData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setIntegrations(prev => prev.map(integration => 
        integration.id === id ? data : integration
      ));

      toast({
        title: "Integration updated",
        description: `${data.name} has been successfully updated.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error updating integration:', error);
      toast({
        title: "Error updating integration",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const integration = integrations.find(i => i.id === id);
      
      const { error } = await supabase
        .from('marketplace_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev => prev.filter(integration => integration.id !== id));
      toast({
        title: "Integration deleted",
        description: `${integration?.name} has been successfully removed.`,
      });
    } catch (error: any) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Error deleting integration",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const syncIntegration = async (id: string) => {
    try {
      const integration = integrations.find(i => i.id === id);
      if (!integration) throw new Error('Integration not found');

      // Update last sync time
      await updateIntegration(id, {
        last_sync: new Date().toISOString(),
        status: 'connected'
      });

      // TODO: Replace with actual webhook URL from configuration
      const webhookUrl = integration.webhook_url || 'https://hooks.zapier.com/hooks/catch/your-webhook-id/';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          marketplace: integration.name,
          action: 'sync',
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Sync started",
        description: `${integration.name} is being synchronized...`,
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync error",
        description: "Error during synchronization. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    syncIntegration,
    refetch: fetchIntegrations
  };
};
