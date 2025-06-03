
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

        // Use your n8n callback URL as redirect URI
        const redirectUri = 'https://n8n.melemeng.com/webhook/ebay-callback';
        
        // All the eBay scopes from your provided URL
        const scopes = [
          'https://api.ebay.com/oauth/api_scope',
          'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
          'https://api.ebay.com/oauth/api_scope/sell.marketing',
          'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
          'https://api.ebay.com/oauth/api_scope/sell.inventory',
          'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
          'https://api.ebay.com/oauth/api_scope/sell.account',
          'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
          'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
          'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
          'https://api.ebay.com/oauth/api_scope/sell.finances',
          'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',
          'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
          'https://api.ebay.com/oauth/api_scope/sell.reputation',
          'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
          'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
          'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly',
          'https://api.ebay.com/oauth/api_scope/sell.stores',
          'https://api.ebay.com/oauth/api_scope/sell.stores.readonly',
          'https://api.ebay.com/oauth/scope/sell.edelivery'
        ];
        
        // Construct eBay OAuth URL with your n8n callback URL
        const ebayAuthUrl = `https://auth.ebay.com/oauth2/authorize?` +
          `client_id=FloatCra-n8n-PRD-5b004feb6-52b5e1c1&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(scopes.join(' '))}&` +
          `state=${user.id}`;

        console.log('Opening eBay OAuth URL:', ebayAuthUrl);
        console.log('Redirect URI (n8n webhook):', redirectUri);
        
        // Open eBay auth in new popup window
        const popup = window.open(
          ebayAuthUrl, 
          'ebayAuth', 
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for messages from n8n or manual integration creation
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
          } else if (event.data.type === 'EBAY_OAUTH_ERROR') {
            console.error('eBay OAuth error:', event.data.error);
            setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
            
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
