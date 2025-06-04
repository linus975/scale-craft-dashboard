import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { supabase } from '@/integrations/supabase/client';

export const useMarketplaceSync = () => {
  const { integrations, updateIntegration } = useMarketplaceIntegrations();
  const { toast } = useToast();
  const [syncFrequencies, setSyncFrequencies] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});

  const handleSyncNow = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) {
      toast({
        title: "Error",
        description: "Integration not found.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is an eBay integration
    const isEbayIntegration = integration.ebay_username || integration.marketplace_type === 'ebay';
    
    try {
      console.log('Starting webhook call...');
      console.log('Integration:', integration.name);
      console.log('Is eBay integration:', isEbayIntegration);

      let webhookUrl: string;
      let requestBody: any;

      if (isEbayIntegration) {
        // For eBay integrations, use the specific webhook URL with HTTPS
        webhookUrl = 'https://n8n.melemeng.com/webhook-test/Ebay_Orders';
        
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not logged in');
        }

        requestBody = {
          user_id: user.id,
          shop_name: integration.ebay_username || integration.name,
          marketplace: 'eBay',
          timestamp: new Date().toISOString(),
          action: 'sync'
        };
        
        console.log('eBay webhook URL:', webhookUrl);
        console.log('eBay request body:', JSON.stringify(requestBody, null, 2));
      } else {
        // For other integrations, use the existing logic
        webhookUrl = integration.webhook_url;
        
        if (!webhookUrl) {
          toast({
            title: "Error",
            description: "No webhook URL configured for this integration. Please edit the integration and add a webhook URL.",
            variant: "destructive",
          });
          return;
        }

        requestBody = {
          marketplace: integration.name,
          marketplace_id: integrationId,
          action: 'sync',
          timestamp: new Date().toISOString(),
          client_id: integration.client_id,
          api_key: integration.api_key,
          sync_fields: {
            ean_number: true,
            product_id: true,
            order_id: true,
            customer_email: true,
            amount: true,
            quantity: true,
            material: true,
            design_file: true
          }
        };
        
        console.log('Standard webhook URL:', webhookUrl);
        console.log('Standard request body:', JSON.stringify(requestBody, null, 2));
      }

      // Update last sync time in database first (only for non-eBay virtual integrations)
      if (!integrationId.startsWith('ebay-token-')) {
        await updateIntegration(integrationId, {
          last_sync: new Date().toISOString(),
          status: 'connected'
        });
      }

      // Call the webhook URL with CORS enabled (no no-cors mode)
      console.log('Making fetch request to webhook...');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Check response status since CORS is now enabled
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Webhook request sent successfully');

      toast({
        title: "Sync started",
        description: `${integration.name} webhook was successfully called.`,
      });
    } catch (error: any) {
      console.error('Sync error details:', error);
      console.error('Error message:', error.message);
      
      toast({
        title: "Sync Error",
        description: `Error during synchronization: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleFrequencySync = async (integrationId: string) => {
    const frequency = syncFrequencies[integrationId];
    
    if (!frequency) {
      toast({
        title: "Error",
        description: "Please select a sync frequency.",
        variant: "destructive",
      });
      return;
    }

    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) {
      toast({
        title: "Error",
        description: "Integration not found.",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = integration.webhook_url;
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "No webhook URL configured for this integration. Please edit the integration and add a webhook URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(prev => ({ ...prev, [integrationId]: true }));

    try {
      console.log('Starting frequency sync webhook call...');
      console.log('Integration:', integration.name);
      console.log('Webhook URL:', webhookUrl);
      console.log('Frequency:', frequency);
      
      const requestBody = {
        interval: frequency,
        marketplace_id: integrationId,
        timestamp: new Date().toISOString(),
        action: 'schedule'
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // With no-cors mode, we can't check response status, so we assume success
      console.log('Frequency sync webhook request sent successfully');

      const syncFrequencyOptions = [
        { value: 'every30min', label: 'Every 30 minutes' },
        { value: 'hourly', label: 'Every hour' },
        { value: 'every3hours', label: 'Every 3 hours' }
      ];

      toast({
        title: "Sync frequency configured",
        description: `Automatic sync has been set to "${syncFrequencyOptions.find(opt => opt.value === frequency)?.label}".`,
      });
    } catch (error: any) {
      console.error('Error setting sync frequency:', error);
      toast({
        title: "Configuration Error",
        description: `The sync frequency could not be set: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleSyncFrequencyChange = (integrationId: string, frequency: string) => {
    setSyncFrequencies(prev => ({ ...prev, [integrationId]: frequency }));
  };

  return {
    syncFrequencies,
    isSyncing,
    handleSyncNow,
    handleFrequencySync,
    handleSyncFrequencyChange
  };
};
