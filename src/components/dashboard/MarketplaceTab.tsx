import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { useMarketplaceOrders } from '@/hooks/useMarketplaceOrders';
import { useToast } from '@/hooks/use-toast';
import AddIntegrationDialog from './marketplace/AddIntegrationDialog';
import CredentialsDialog from './marketplace/CredentialsDialog';
import MarketplaceConnections from './marketplace/MarketplaceConnections';
import RecentOrdersCard from './marketplace/RecentOrdersCard';
import AutomationSettings from './marketplace/AutomationSettings';

interface MarketplaceTabProps {
  onNavigateToAllOrders: () => void;
}

const MarketplaceTab: React.FC<MarketplaceTabProps> = ({ onNavigateToAllOrders }) => {
  const { integrations, loading, createIntegration, updateIntegration, deleteIntegration } = useMarketplaceIntegrations();
  const { orders: recentOrders, loading: ordersLoading } = useMarketplaceOrders();
  const { toast } = useToast();
  
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<any>(null);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [credentials, setCredentials] = useState({
    clientId: '',
    apiKey: '',
    webhookUrl: ''
  });
  const [syncFrequencies, setSyncFrequencies] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
  const [automationSettings, setAutomationSettings] = useState({
    autoCreateJobs: true,
    parameterMapping: true,
    orderNotifications: false
  });

  const handleAutomationToggle = (setting: string) => {
    setAutomationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

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
        icon: selectedMarketplace.icon,
        status: 'connected'
      });
      
      setIsCredentialsDialogOpen(false);
      setCredentials({ clientId: '', apiKey: '', webhookUrl: '' });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditIntegration = (integration: any) => {
    setEditingIntegration(integration);
    setCredentials({
      clientId: integration.client_id || '',
      apiKey: integration.api_key || '',
      webhookUrl: integration.webhook_url || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await updateIntegration(editingIntegration.id, {
        client_id: credentials.clientId,
        api_key: credentials.apiKey,
        webhook_url: credentials.webhookUrl
      });
      
      setIsEditDialogOpen(false);
      setCredentials({ clientId: '', apiKey: '', webhookUrl: '' });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Marketplace Integrations</h2>
          <p className="text-slate-600">Connect to online marketplaces and automate order processing</p>
        </div>
        <AddIntegrationDialog
          isOpen={isIntegrationDialogOpen}
          onOpenChange={setIsIntegrationDialogOpen}
          onMarketplaceSelect={handleMarketplaceSelect}
        />

        <CredentialsDialog
          isOpen={isCredentialsDialogOpen}
          onOpenChange={setIsCredentialsDialogOpen}
          selectedMarketplace={selectedMarketplace}
          credentials={credentials}
          onCredentialsChange={setCredentials}
          onSubmit={handleCredentialsSubmit}
        />

        <CredentialsDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          selectedMarketplace={editingIntegration}
          credentials={credentials}
          onCredentialsChange={setCredentials}
          onSubmit={handleEditSubmit}
          isEdit={true}
        />
      </div>

      <MarketplaceConnections
        integrations={integrations}
        syncFrequencies={syncFrequencies}
        isSyncing={isSyncing}
        onSyncFrequencyChange={handleSyncFrequencyChange}
        onSyncNow={handleSyncNow}
        onFrequencySync={handleFrequencySync}
        onEditIntegration={handleEditIntegration}
        onDeleteIntegration={handleDeleteIntegration}
      />

      <RecentOrdersCard
        orders={recentOrders}
        loading={ordersLoading}
        onNavigateToAllOrders={onNavigateToAllOrders}
      />

      <AutomationSettings
        settings={automationSettings}
        onToggle={handleAutomationToggle}
      />
    </div>
  );
};

export default MarketplaceTab;
