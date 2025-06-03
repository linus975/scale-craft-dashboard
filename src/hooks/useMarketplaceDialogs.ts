import { useState } from 'react';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { supabase } from '@/integrations/supabase/client';

export const useMarketplaceDialogs = () => {
  const { createIntegration, updateIntegration, deleteIntegration, refetch } = useMarketplaceIntegrations();
  
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<any>(null);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [loadingMarketplaces, setLoadingMarketplaces] = useState<Record<string, boolean>>({});
  const [credentials, setCredentials] = useState({
    clientId: '',
    apiKey: '',
    webhookUrl: '',
    syncFrequency: ''
  });

  const handleMarketplaceSelect = async (marketplace: any) => {
    // Handle eBay OAuth flow
    if (marketplace.id === 'ebay') {
      setLoadingMarketplaces(prev => ({ ...prev, ebay: true }));
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('User not authenticated');
          setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
          return;
        }

        // Construct eBay OAuth URL with user ID as state parameter
        const redirectUri = `${window.location.origin}/functions/v1/ebay-oauth-callback`;
        const ebayAuthUrl = `https://auth.ebay.com/oauth2/authorize?` +
          `client_id=FloatCra-n8n-PRD-5b004feb6-52b5e1c1&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=https://api.ebay.com/oauth/api_scope&` +
          `state=${user.id}`;

        console.log('Opening eBay OAuth URL:', ebayAuthUrl);
        
        // Open eBay auth in new popup window
        const popup = window.open(
          ebayAuthUrl, 
          'ebayAuth', 
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for messages from the popup (success/failure)
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'EBAY_OAUTH_SUCCESS') {
            console.log('eBay OAuth successful:', event.data.integration);
            setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
            
            // Refresh integrations to show the new one
            refetch();
            
            // Close the popup if still open
            if (popup && !popup.closed) {
              popup.close();
            }
            
            // Remove event listener
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);
        
        // Also check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
            window.removeEventListener('message', handleMessage);
            clearInterval(checkClosed);
          }
        }, 1000);
        
        // Timeout after 5 minutes
        setTimeout(() => {
          setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
          if (popup && !popup.closed) {
            popup.close();
          }
        }, 300000); // 5 minutes
        
      } catch (error) {
        console.error('Error initiating eBay OAuth:', error);
        setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
      }
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
    loadingMarketplaces,
    setCredentials: handleCredentialsChange,
    handleMarketplaceSelect,
    handleCredentialsSubmit,
    handleEditIntegration,
    handleEditSubmit,
    handleDeleteIntegration
  };
};
