
import { useState } from 'react';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';

export const useMarketplaceDialogs = () => {
  const { createIntegration, updateIntegration, deleteIntegration } = useMarketplaceIntegrations();
  
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<any>(null);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [credentials, setCredentials] = useState({
    clientId: '',
    apiKey: '',
    webhookUrl: '',
    syncFrequency: ''
  });

  const handleMarketplaceSelect = (marketplace: any) => {
    setSelectedMarketplace(marketplace);
    setIsIntegrationDialogOpen(false);
    setIsCredentialsDialogOpen(true);
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
      setCredentials({ clientId: '', apiKey: '', webhookUrl: '', syncFrequency: '' });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditIntegration = (integration: any) => {
    setEditingIntegration(integration);
    setCredentials({
      clientId: integration.client_id || '',
      apiKey: integration.api_key || '',
      webhookUrl: integration.webhook_url || '',
      syncFrequency: integration.sync_frequency || ''
    });
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
      setCredentials({ clientId: '', apiKey: '', webhookUrl: '', syncFrequency: '' });
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

  // Create a wrapper function that handles the type properly
  const handleCredentialsChange = (newCredentials: { clientId: string; apiKey: string; webhookUrl: string; syncFrequency?: string }) => {
    setCredentials({
      clientId: newCredentials.clientId,
      apiKey: newCredentials.apiKey,
      webhookUrl: newCredentials.webhookUrl,
      syncFrequency: newCredentials.syncFrequency || ''
    });
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
    setCredentials: handleCredentialsChange,
    handleMarketplaceSelect,
    handleCredentialsSubmit,
    handleEditIntegration,
    handleEditSubmit,
    handleDeleteIntegration
  };
};
