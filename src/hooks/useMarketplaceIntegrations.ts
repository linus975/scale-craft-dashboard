
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type MarketplaceIntegration = Database['public']['Tables']['marketplace_integrations']['Row'];
type MarketplaceIntegrationInsert = Database['public']['Tables']['marketplace_integrations']['Insert'];
type MarketplaceIntegrationUpdate = Database['public']['Tables']['marketplace_integrations']['Update'];

// Extended type that includes eBay token data
type EnhancedMarketplaceIntegration = MarketplaceIntegration & {
  ebay_username?: string;
  token_status?: 'active' | 'expired';
  token_expires?: string;
};

export const useMarketplaceIntegrations = () => {
  const [integrations, setIntegrations] = useState<EnhancedMarketplaceIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      // Fetch marketplace integrations
      const { data: marketplaceData, error: marketplaceError } = await supabase
        .from('marketplace_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (marketplaceError) throw marketplaceError;

      // Fetch eBay tokens
      const { data: ebayTokens, error: ebayError } = await supabase
        .from('ebay_oauth_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (ebayError) throw ebayError;

      // Combine data: merge eBay tokens with marketplace integrations
      const combinedData: EnhancedMarketplaceIntegration[] = [];
      
      // Add existing marketplace integrations
      if (marketplaceData) {
        combinedData.push(...marketplaceData);
      }

      // Add eBay tokens as virtual marketplace integrations
      if (ebayTokens) {
        ebayTokens.forEach(token => {
          const isExpired = token.access_token_expires ? 
            new Date(token.access_token_expires) < new Date() : false;

          combinedData.push({
            id: `ebay-token-${token.id}`,
            user_id: token.user_id,
            name: `eBay (${token.ebay_username})`,
            marketplace_type: 'ebay',
            client_id: null,
            api_key: token.access_token,
            webhook_url: 'https://n8n.melemeng.com/webhook/Ebay_Sync',
            sync_frequency: 'hourly',
            icon: '🛒',
            status: isExpired ? 'disconnected' : 'connected',
            last_sync: null,
            orders_synced: 0,
            created_at: token.created_at,
            updated_at: token.updated_at,
            ebay_username: token.ebay_username,
            token_status: isExpired ? 'expired' : 'active',
            token_expires: token.access_token_expires
          });
        });
      }

      setIntegrations(combinedData);
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

      // Refresh data to include the new integration
      await fetchIntegrations();
      
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

      // Refresh data
      await fetchIntegrations();

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
      
      // Check if this is an eBay token (virtual integration)
      if (id.startsWith('ebay-token-')) {
        const tokenId = id.replace('ebay-token-', '');
        const { error } = await supabase
          .from('ebay_oauth_tokens')
          .delete()
          .eq('id', tokenId);

        if (error) throw error;
      } else {
        // Regular marketplace integration
        const { error } = await supabase
          .from('marketplace_integrations')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      // Refresh data
      await fetchIntegrations();
      
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

      // For eBay tokens, we can't update the last_sync in marketplace_integrations
      // since they are virtual integrations, but we can still trigger the webhook
      if (!id.startsWith('ebay-token-')) {
        await updateIntegration(id, {
          last_sync: new Date().toISOString(),
          status: 'connected'
        });
      }

      const webhookUrl = integration.webhook_url || 'https://n8n.melemeng.com/webhook/Ebay_Sync';
      
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
