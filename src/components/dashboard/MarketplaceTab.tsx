
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Link,
  RefreshCw,
  Globe,
  Package,
  ShoppingCart,
  Zap,
  Settings,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MarketplaceTab: React.FC = () => {
  const { toast } = useToast();
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<any>(null);
  const [editingMarketplace, setEditingMarketplace] = useState<any>(null);
  const [credentials, setCredentials] = useState({
    clientId: '',
    apiKey: '',
    webhookUrl: ''
  });
  const [automationSettings, setAutomationSettings] = useState({
    autoCreateJobs: true,
    parameterMapping: true,
    orderNotifications: false
  });

  // Mock marketplace data
  const [marketplaces, setMarketplaces] = useState([
    { id: 1, name: "eBay", status: "connected", orders: 45, lastSync: "2 minutes ago", icon: "🛒", clientId: "ebay_client_123", apiKey: "****" },
    { id: 2, name: "Etsy", status: "connected", orders: 23, lastSync: "5 minutes ago", icon: "🎨", clientId: "etsy_client_456", apiKey: "****" },
    { id: 3, name: "Shopify", status: "disconnected", orders: 0, lastSync: "Never", icon: "🛍️", clientId: "", apiKey: "" },
    { id: 4, name: "Amazon", status: "pending", orders: 0, lastSync: "Never", icon: "📦", clientId: "", apiKey: "" },
  ]);

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

  const handleCredentialsSubmit = () => {
    console.log('Marketplace credentials:', {
      marketplace: selectedMarketplace,
      credentials
    });
    
    toast({
      title: "Integration erfolgreich",
      description: `${selectedMarketplace.name} wurde erfolgreich verbunden.`,
    });
    
    setIsCredentialsDialogOpen(false);
    setCredentials({ clientId: '', apiKey: '', webhookUrl: '' });
  };

  const handleEditMarketplace = (marketplace: any) => {
    setEditingMarketplace(marketplace);
    setCredentials({
      clientId: marketplace.clientId || '',
      apiKey: marketplace.apiKey || '',
      webhookUrl: marketplace.webhookUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    setMarketplaces(prev => prev.map(mp => 
      mp.id === editingMarketplace.id 
        ? { ...mp, clientId: credentials.clientId, apiKey: credentials.apiKey, webhookUrl: credentials.webhookUrl }
        : mp
    ));
    
    toast({
      title: "Integration aktualisiert",
      description: `${editingMarketplace.name} wurde erfolgreich aktualisiert.`,
    });
    
    setIsEditDialogOpen(false);
    setCredentials({ clientId: '', apiKey: '', webhookUrl: '' });
    setEditingMarketplace(null);
  };

  const handleDeleteMarketplace = (marketplaceId: number) => {
    const marketplace = marketplaces.find(mp => mp.id === marketplaceId);
    setMarketplaces(prev => prev.filter(mp => mp.id !== marketplaceId));
    
    toast({
      title: "Integration gelöscht",
      description: `${marketplace?.name} wurde erfolgreich entfernt.`,
    });
  };

  const handleSyncNow = async (marketplaceName: string) => {
    console.log('Syncing marketplace:', marketplaceName);
    
    // TODO: Replace with actual webhook URL from configuration
    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/your-webhook-id/';
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          marketplace: marketplaceName,
          action: 'sync',
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Sync gestartet",
        description: `${marketplaceName} wird synchronisiert...`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync-Fehler",
        description: "Fehler beim Synchronisieren. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

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
              <DialogTitle>Edit Integration - {editingMarketplace?.name}</DialogTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketplaces.map((marketplace) => (
              <div key={marketplace.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{marketplace.icon}</span>
                    <div>
                      <h4 className="font-medium text-slate-900">{marketplace.name}</h4>
                      <p className="text-sm text-slate-500">Last sync: {marketplace.lastSync}</p>
                    </div>
                  </div>
                  <Badge className={getMarketplaceStatusColor(marketplace.status)}>
                    {marketplace.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{marketplace.orders} orders synced</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSyncNow(marketplace.name)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditMarketplace(marketplace)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteMarketplace(marketplace.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <CardDescription>Orders automatically synced from marketplaces</CardDescription>
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
