import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Link,
  RefreshCw,
  Globe,
  Package,
  ShoppingCart,
  Zap,
  Settings,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Clock
} from 'lucide-react';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceTabProps {
  onNavigateToAllOrders: () => void;
}

const MarketplaceTab: React.FC<MarketplaceTabProps> = ({ onNavigateToAllOrders }) => {
  const { integrations, loading, createIntegration, updateIntegration, deleteIntegration, syncIntegration } = useMarketplaceIntegrations();
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

  const mockRecentOrders = [
    { id: 1, marketplace: "eBay", product: "Custom Phone Case", customer: "john.doe@email.com", status: "processing", amount: "$24.99" },
    { id: 2, marketplace: "Etsy", product: "Personalized Keychain", customer: "jane.smith@email.com", status: "printed", amount: "$12.50" },
    { id: 3, marketplace: "eBay", product: "Custom Bracket", customer: "mike.wilson@email.com", status: "shipped", amount: "$18.75" },
  ];

  const availableMarketplaces = [
    { id: 'ebay', name: 'eBay', icon: '🛒' },
    { id: 'amazon', name: 'Amazon', icon: '📦' },
    { id: 'hood', name: 'Hood', icon: '🏪' },
    { id: 'kaufland', name: 'Kaufland', icon: '🏬' },
    { id: 'shopify', name: 'Shopify', icon: '🛍️' },
    { id: 'custom', name: 'Custom API', icon: '🔌' }
  ];

  const syncFrequencyOptions = [
    { value: 'every30min', label: 'Alle 30 Minuten' },
    { value: 'hourly', label: 'Jede Stunde' },
    { value: 'every3hours', label: 'Alle 3 Stunden' }
  ];

  const getMarketplaceStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'printed': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAutomationToggle = (setting: keyof typeof automationSettings) => {
    setAutomationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
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
    try {
      await syncIntegration(integrationId);
    } catch (error) {
      // Error handling is done in the hook
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

    setIsSyncing(prev => ({ ...prev, [integrationId]: true }));

    try {
      const response = await fetch('http://localhost:5678/webhook-test/Hood_Sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          interval: frequency,
          marketplace_id: integrationId,
          timestamp: new Date().toISOString()
        }),
      });

      toast({
        title: "Sync-Häufigkeit konfiguriert",
        description: `Der automatische Abruf wurde auf "${syncFrequencyOptions.find(opt => opt.value === frequency)?.label}" eingestellt.`,
      });

      console.log('Frequency sync request sent:', { interval: frequency, marketplace_id: integrationId });
    } catch (error) {
      console.error('Error setting sync frequency:', error);
      toast({
        title: "Fehler beim Konfigurieren",
        description: "Die Sync-Häufigkeit konnte nicht eingestellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(prev => ({ ...prev, [integrationId]: false }));
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
        <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Marketplace</DialogTitle>
              <DialogDescription>
                Choose which marketplace or shop system you want to connect
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {availableMarketplaces.map((marketplace) => (
                <Button
                  key={marketplace.id}
                  variant="outline"
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleMarketplaceSelect(marketplace)}
                >
                  <span className="text-lg">{marketplace.icon}</span>
                  <span className="text-xs">{marketplace.name}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* API Credentials Dialog */}
        <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>API Credentials - {selectedMarketplace?.name}</DialogTitle>
              <DialogDescription>
                Geben Sie Ihre API-Zugangsdaten ein um die Integration zu vervollständigen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  placeholder="Ihre Client ID"
                  value={credentials.clientId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key / Password</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Ihr API Key"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-webhook-url.com"
                  value={credentials.webhookUrl}
                  onChange={(e) => setCredentials(prev => ({ ...prev, webhookUrl: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleCredentialsSubmit} 
                className="w-full"
                disabled={!credentials.clientId || !credentials.apiKey}
              >
                Integration hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Marketplace Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Integration - {editingIntegration?.name}</DialogTitle>
              <DialogDescription>
                Bearbeiten Sie die API-Zugangsdaten für diese Integration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editClientId">Client ID</Label>
                <Input
                  id="editClientId"
                  placeholder="Ihre Client ID"
                  value={credentials.clientId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editApiKey">API Key / Password</Label>
                <Input
                  id="editApiKey"
                  type="password"
                  placeholder="Ihr API Key"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editWebhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="editWebhookUrl"
                  placeholder="https://your-webhook-url.com"
                  value={credentials.webhookUrl}
                  onChange={(e) => setCredentials(prev => ({ ...prev, webhookUrl: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleEditSubmit} 
                className="w-full"
                disabled={!credentials.clientId || !credentials.apiKey}
              >
                Integration aktualisieren
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Marketplace Connections */}
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
              <p>Keine Marktplatz-Integrationen vorhanden</p>
              <p className="text-sm">Fügen Sie Ihre erste Integration hinzu, um zu beginnen</p>
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
                  
                  {/* Sync Frequency Section */}
                  <div className="mb-3 space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Automatischer Abruf konfigurieren:</Label>
                    <div className="flex gap-2">
                      <Select
                        value={syncFrequencies[integration.id] || ''}
                        onValueChange={(value) => setSyncFrequencies(prev => ({ ...prev, [integration.id]: value }))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Häufigkeit wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {syncFrequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleFrequencySync(integration.id)}
                        disabled={!syncFrequencies[integration.id] || isSyncing[integration.id]}
                        className="min-w-[120px]"
                      >
                        {isSyncing[integration.id] ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {isSyncing[integration.id] ? 'Wird gesetzt...' : 'Abruf starten'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{integration.orders_synced} orders synced</span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSyncNow(integration.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditIntegration(integration)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteIntegration(integration.id)}
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

      {/* Recent Orders */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Orders automatically synced from marketplaces</CardDescription>
            </div>
            <Button variant="outline" onClick={onNavigateToAllOrders}>
              <Eye className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentOrders.map((order, index) => (
              <div key={order.id}>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{order.product}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{order.marketplace}</span>
                        <span>•</span>
                        <span>{order.customer}</span>
                        <span>•</span>
                        <span>{order.amount}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getOrderStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                {index < mockRecentOrders.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </CardTitle>
          <CardDescription>Configure automatic order processing and job creation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <h4 className="font-medium text-green-900">Auto-create print jobs</h4>
              <p className="text-sm text-green-700">Automatically create print jobs when new orders are received</p>
            </div>
            <Switch
              checked={automationSettings.autoCreateJobs}
              onCheckedChange={() => handleAutomationToggle('autoCreateJobs')}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Parameter mapping</h4>
              <p className="text-sm text-blue-700">Map order customization data to CAD parameters</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={automationSettings.parameterMapping}
                onCheckedChange={() => handleAutomationToggle('parameterMapping')}
              />
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <h4 className="font-medium text-yellow-900">Order notifications</h4>
              <p className="text-sm text-yellow-700">Send notifications when orders require manual review</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={automationSettings.orderNotifications}
                onCheckedChange={() => handleAutomationToggle('orderNotifications')}
              />
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceTab;
