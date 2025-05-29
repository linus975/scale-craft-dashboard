
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
        title: "Fehler",
        description: "Integration nicht gefunden.",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = integration.webhook_url;
    
    if (!webhookUrl) {
      toast({
        title: "Fehler",
        description: "Keine Webhook-URL für diese Integration konfiguriert. Bitte bearbeiten Sie die Integration und fügen Sie eine Webhook-URL hinzu.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting webhook call...');
      console.log('Integration:', integration.name);
      console.log('Webhook URL:', webhookUrl);
      console.log('Request method: POST');
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'User-Agent': 'MarketplaceSync/1.0',
      });
      
      const requestBody = {
        marketplace: integration.name,
        marketplace_id: integrationId,
        action: 'sync',
        timestamp: new Date().toISOString(),
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      // Update last sync time in database first
      await updateIntegration(integrationId, {
        last_sync: new Date().toISOString(),
        status: 'connected'
      });

      // Call the webhook URL with no-cors mode to avoid CORS issues
      console.log('Making fetch request to webhook with no-cors mode...');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MarketplaceSync/1.0',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Request sent successfully (no-cors mode)');

      toast({
        title: "Sync gestartet",
        description: `${integration.name} wird synchronisiert. Webhook wurde aufgerufen.`,
      });
    } catch (error: any) {
      console.error('Sync error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      toast({
        title: "Sync-Fehler",
        description: `Fehler beim Synchronisieren: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleFrequencySync = async (integrationId: string) => {
    const frequency = syncFrequencies[integrationId];
    
    if (!frequency) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Sync-Häufigkeit aus.",
        variant: "destructive",
      });
      return;
    }

    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) {
      toast({
        title: "Fehler",
        description: "Integration nicht gefunden.",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = integration.webhook_url;
    
    if (!webhookUrl) {
      toast({
        title: "Fehler",
        description: "Keine Webhook-URL für diese Integration konfiguriert. Bitte bearbeiten Sie die Integration und fügen Sie eine Webhook-URL hinzu.",
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
          'User-Agent': 'MarketplaceSync/1.0',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Frequency sync request sent successfully (no-cors mode)');

      const syncFrequencyOptions = [
        { value: 'every30min', label: 'Alle 30 Minuten' },
        { value: 'hourly', label: 'Jede Stunde' },
        { value: 'every3hours', label: 'Alle 3 Stunden' }
      ];

      toast({
        title: "Sync-Häufigkeit konfiguriert",
        description: `Der automatische Abruf wurde auf "${syncFrequencyOptions.find(opt => opt.value === frequency)?.label}" eingestellt.`,
      });

      console.log('Frequency sync request sent:', { interval: frequency, marketplace_id: integrationId });
    } catch (error: any) {
      console.error('Error setting sync frequency:', error);
      toast({
        title: "Fehler beim Konfigurieren",
        description: `Die Sync-Häufigkeit konnte nicht eingestellt werden: ${error.message}`,
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
