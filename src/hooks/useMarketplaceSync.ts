
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { EbaySyncService } from '@/services/ebaySync';
import { StandardMarketplaceSyncService } from '@/services/standardMarketplaceSync';
import { SyncFrequencyService } from '@/services/syncFrequencyService';

export const useMarketplaceSync = () => {
  const { integrations, updateIntegration } = useMarketplaceIntegrations();
  const { toast } = useToast();
  const [syncFrequencies, setSyncFrequencies] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});

  // Initialize services
  const ebaySyncService = new EbaySyncService(toast);
  const standardSyncService = new StandardMarketplaceSyncService(toast);
  const frequencyService = new SyncFrequencyService(toast);

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
    
    if (isEbayIntegration) {
      await ebaySyncService.syncEbayIntegration(integration, integrationId, updateIntegration);
    } else {
      await standardSyncService.syncStandardIntegration(integration, integrationId, updateIntegration);
    }
  };

  const handleFrequencySync = async (integrationId: string) => {
    const frequency = syncFrequencies[integrationId];
    const integration = integrations.find(i => i.id === integrationId);
    
    if (!integration) {
      toast({
        title: "Error",
        description: "Integration not found.",
        variant: "destructive",
      });
      return;
    }

    await frequencyService.configureSyncFrequency(integrationId, frequency, integration, setIsSyncing);
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
