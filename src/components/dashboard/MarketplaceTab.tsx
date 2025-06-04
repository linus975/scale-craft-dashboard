
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { useMarketplaceOrders } from '@/hooks/useMarketplaceOrders';
import { useMarketplaceSync } from '@/hooks/useMarketplaceSync';
import { useMarketplaceDialogs } from '@/hooks/useMarketplaceDialogs';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { useEbayTokens } from '@/hooks/useEbayTokens';
import AddIntegrationDialog from './marketplace/AddIntegrationDialog';
import CredentialsDialog from './marketplace/CredentialsDialog';
import MarketplaceConnections from './marketplace/MarketplaceConnections';
import EbayTokensCard from './marketplace/EbayTokensCard';
import RecentOrdersCard from './marketplace/RecentOrdersCard';
import AutomationSettings from './marketplace/AutomationSettings';

interface MarketplaceTabProps {
  onNavigateToAllOrders: () => void;
}

const MarketplaceTab: React.FC<MarketplaceTabProps> = ({ onNavigateToAllOrders }) => {
  const { integrations, loading } = useMarketplaceIntegrations();
  const { orders: recentOrders, loading: ordersLoading, upsertOrder } = useMarketplaceOrders();
  const { tokens, loading: tokensLoading, deleteToken, refetch: refetchTokens } = useEbayTokens();
  
  const {
    syncFrequencies,
    isSyncing,
    handleSyncNow,
    handleFrequencySync,
    handleSyncFrequencyChange
  } = useMarketplaceSync();

  const {
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
  } = useMarketplaceDialogs();

  const { automationSettings, handleAutomationToggle } = useAutomationSettings();

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
          loadingMarketplaces={loadingMarketplaces}
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

      <EbayTokensCard
        tokens={tokens}
        loading={tokensLoading}
        onDeleteToken={deleteToken}
        onRefreshTokens={refetchTokens}
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
