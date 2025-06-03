
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { useEbayOAuth } from '@/hooks/useEbayOAuth';
import { useMarketplaceDialogState } from '@/hooks/useMarketplaceDialogState';
import { useMarketplaceCredentials } from '@/hooks/useMarketplaceCredentials';

export const useMarketplaceDialogs = () => {
  const { createIntegration, updateIntegration, deleteIntegration, refetch } = useMarketplaceIntegrations();
  const { loadingMarketplaces, initiateEbayAuth } = useEbayOAuth();
  const {
    isIntegrationDialogOpen,
    setIsIntegrationDialogOpen,
    isCredentialsDialogOpen,
    setIsCredentialsDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedMarketplace,
    setSelectedMarketplace,
    editingIntegration,
    setEditingIntegration
  } = useMarketplaceDialogState();
  const {
    credentials,
    setCredentials,
    resetCredentials,
    setCredentialsFromIntegration
  } = useMarketplaceCredentials();

  const handleMarketplaceSelect = async (marketplace: any) => {
    // Handle eBay OAuth flow
    if (marketplace.id === 'ebay') {
      await initiateEbayAuth(refetch);
    } else {
      // Regular flow for other marketplaces
      setSelectedMarketplace(marketplace);
      setIsIntegrationDialogOpen(false);
      setIsCredentialsDialogOpen(true);
    }
  };

  const handleCredentialsSubmit = async () => {
    try {
      await createIntegration({
        name: selectedMarketplace.name,
        marketplace_type: selectedMarketplace.id,
        client_id: credentials.clientId,
        api_key: credentials.apiKey,
        webhook_url: credentials.webhookUrl,
        sync_frequency: credentials.syncFrequency,
        icon: selectedMarketplace.icon,
        status: 'connected'
      });
      
      setIsCredentialsDialogOpen(false);
      resetCredentials();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditIntegration = (integration: any) => {
    setEditingIntegration(integration);
    setCredentialsFromIntegration(integration);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await updateIntegration(editingIntegration.id, {
        client_id: credentials.clientId,
        api_key: credentials.apiKey,
        webhook_url: credentials.webhookUrl,
        sync_frequency: credentials.syncFrequency
      });
      
      setIsEditDialogOpen(false);
      resetCredentials();
      setEditingIntegration(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      await deleteIntegration(integrationId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return {
    isIntegrationDialogOpen,
    setIsIntegrationDialogOpen,
    isCredentialsDialogOpen,
    setIsCredentialsDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedMarketplace,
    editingIntegration,
    credentials,
    loadingMarketplaces,
    setCredentials,
    handleMarketplaceSelect,
    handleCredentialsSubmit,
    handleEditIntegration,
    handleEditSubmit,
    handleDeleteIntegration
  };
};
