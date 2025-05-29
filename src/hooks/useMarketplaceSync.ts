
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';

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

    const webhookUrl = integration.webhook_url;
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "No webhook URL configured for this integration. Please edit the integration and add a webhook URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting webhook call...');
      console.log('Integration:', integration.name);
      console.log('Webhook URL:', webhookUrl);
      console.log('Request method: POST');
      
      const requestBody = {
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
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      // Update last sync time in database first
      await updateIntegration(integrationId, {
        last_sync: new Date().toISOString(),
        status: 'connected'
      });

      // Call the webhook URL with no-cors to ensure it reaches n8n
      console.log('Making fetch request to webhook...');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // With no-cors mode, we can't check response status, so we assume success
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
