
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, RefreshCw, Edit, Trash2, Clock, User } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: string;
  status: string;
  last_sync: string | null;
  orders_synced: number;
  webhook_url?: string;
  sync_frequency?: string | null;
  ebay_username?: string;
  token_status?: 'active' | 'expired';
  token_expires?: string;
  marketplace_type?: string;
}

interface MarketplaceConnectionsProps {
  integrations: Integration[];
  syncFrequencies: Record<string, string>;
  isSyncing: Record<string, boolean>;
  onSyncFrequencyChange: (integrationId: string, frequency: string) => void;
  onSyncNow: (integrationId: string) => void;
  onFrequencySync: (integrationId: string) => void;
  onEditIntegration: (integration: Integration) => void;
  onDeleteIntegration: (integrationId: string) => void;
}

const MarketplaceConnections: React.FC<MarketplaceConnectionsProps> = ({
  integrations,
  onSyncNow,
  onEditIntegration,
  onDeleteIntegration
}) => {
  const getMarketplaceStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return "Never";
    const date = new Date(lastSync);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const formatSyncFrequency = (frequency: string | null) => {
    if (!frequency) return "Not configured";
    switch (frequency) {
      case 'every30min': return 'Every 30 minutes';
      case 'hourly': return 'Every hour';
      case 'every3hours': return 'Every 3 hours';
      default: return frequency;
    }
  };

  const formatTokenExpiry = (expires: string | null) => {
    if (!expires) return "No expiry date";
    const date = new Date(expires);
    return date.toLocaleString('de-DE');
  };

  const getDisplayName = (integration: Integration) => {
    // For eBay tokens, show just the username
    if (integration.ebay_username) {
      return integration.ebay_username;
    }
    // For other integrations, show the full name
    return integration.name;
  };

  const getMarketplaceName = (integration: Integration) => {
    // For eBay tokens, show "eBay"
    if (integration.ebay_username) {
      return 'eBay';
    }
    // For other integrations, show the marketplace type
    return integration.marketplace_type || integration.name;
  };

  const getMarketplaceIcon = (integration: Integration) => {
    // For eBay tokens, show the eBay logo
    if (integration.ebay_username) {
      return (
        <img 
          src="/lovable-uploads/8c476811-2af8-437a-9f0e-c124bda23526.png" 
          alt="eBay" 
          className="w-6 h-6 object-contain"
        />
      );
    }
    // For other integrations, show the emoji icon
    return <span className="text-xl">{integration.icon}</span>;
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Connected Marketplaces
        </CardTitle>
        <CardDescription>Manage your marketplace connections and sync settings</CardDescription>
      </CardHeader>
      <CardContent>
        {integrations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No marketplace integrations available</p>
            <p className="text-sm">Add your first integration to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getMarketplaceIcon(integration)}
                    <div>
                      <h4 className="font-medium text-slate-900">{getDisplayName(integration)}</h4>
                      <p className="text-sm text-slate-600">{getMarketplaceName(integration)}</p>
                      <p className="text-sm text-slate-500">Last sync: {formatLastSync(integration.last_sync)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getMarketplaceStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                    {integration.token_status && (
                      <Badge className={integration.token_status === 'expired' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}>
                        Token: {integration.token_status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-3 w-3" />
                    <span>Auto sync: {formatSyncFrequency(integration.sync_frequency)}</span>
                  </div>
                  {integration.token_expires && (
                    <div className="text-xs text-slate-500">
                      Token expires: {formatTokenExpiry(integration.token_expires)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{integration.orders_synced} orders synced</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onSyncNow(integration.id)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEditIntegration(integration)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDeleteIntegration(integration.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceConnections;
