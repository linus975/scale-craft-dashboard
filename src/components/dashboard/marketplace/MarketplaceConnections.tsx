
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, RefreshCw, Edit, Trash2 } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: string;
  status: string;
  last_sync: string | null;
  orders_synced: number;
  webhook_url?: string;
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
                    <span className="text-xl">{integration.icon}</span>
                    <div>
                      <h4 className="font-medium text-slate-900">{integration.name}</h4>
                      <p className="text-sm text-slate-500">Last sync: {formatLastSync(integration.last_sync)}</p>
                    </div>
                  </div>
                  <Badge className={getMarketplaceStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
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
