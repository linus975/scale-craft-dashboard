
import { useState } from 'react';

export const useMarketplaceCredentials = () => {
  const [credentials, setCredentials] = useState({
    clientId: '',
    apiKey: '',
    webhookUrl: '',
    syncFrequency: ''
  });

  // Create a wrapper function that handles the type properly
  const handleCredentialsChange = (newCredentials: { clientId: string; apiKey: string; webhookUrl: string; syncFrequency?: string }) => {
    setCredentials({
      clientId: newCredentials.clientId,
      apiKey: newCredentials.apiKey,
      webhookUrl: newCredentials.webhookUrl,
      syncFrequency: newCredentials.syncFrequency || ''
    });
  };

  const resetCredentials = () => {
    setCredentials({ clientId: '', apiKey: '', webhookUrl: '', syncFrequency: '' });
  };

  const setCredentialsFromIntegration = (integration: any) => {
    setCredentials({
      clientId: integration.client_id || '',
      apiKey: integration.api_key || '',
      webhookUrl: integration.webhook_url || '',
      syncFrequency: integration.sync_frequency || ''
    });
  };

  return {
    credentials,
    setCredentials: handleCredentialsChange,
    resetCredentials,
    setCredentialsFromIntegration
  };
};
