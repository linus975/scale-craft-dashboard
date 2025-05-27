
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Cpu, 
  LogOut, 
  Settings, 
  FileText, 
  Layers, 
  Play, 
  Pause, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Upload,
  Download,
  Monitor,
  ShoppingCart,
  Zap,
  Link,
  Sync,
  Globe,
  Package
} from 'lucide-react';

interface DashboardProps {
  user: { email: string };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const mockJobs = [
    { id: 1, name: "Custom Gear Set", status: "printing", progress: 75, material: "PLA", printer: "X1C-2" },
    { id: 2, name: "Prototype Housing", status: "queued", progress: 0, material: "ABS", printer: "A1 Mini-1" },
    { id: 3, name: "Bracket Design", status: "completed", progress: 100, material: "PETG", printer: "X1C-1" },
    { id: 4, name: "Enclosure Part", status: "failed", progress: 45, material: "PLA", printer: "Mk3-2" },
  ];

  const mockDesigns = [
    { id: 1, name: "Parametric Gear", lastModified: "2 hours ago", version: "v1.3" },
    { id: 2, name: "Custom Bracket", lastModified: "1 day ago", version: "v2.1" },
    { id: 3, name: "Housing Template", lastModified: "3 days ago", version: "v1.0" },
  ];

  // Mock marketplace data
  const mockMarketplaces = [
    { id: 1, name: "eBay", status: "connected", orders: 45, lastSync: "2 minutes ago", icon: "🏪" },
    { id: 2, name: "Etsy", status: "connected", orders: 23, lastSync: "5 minutes ago", icon: "🎨" },
    { id: 3, name: "Shopify", status: "disconnected", orders: 0, lastSync: "Never", icon: "🛍️" },
    { id: 4, name: "Amazon", status: "pending", orders: 0, lastSync: "Never", icon: "📦" },
  ];

  const mockRecentOrders = [
    { id: 1, marketplace: "eBay", product: "Custom Phone Case", customer: "john.doe@email.com", status: "processing", amount: "$24.99" },
    { id: 2, marketplace: "Etsy", product: "Personalized Keychain", customer: "jane.smith@email.com", status: "printed", amount: "$12.50" },
    { id: 3, marketplace: "eBay", product: "Custom Bracket", customer: "mike.wilson@email.com", status: "shipped", amount: "$18.75" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printing': return <Play className="h-4 w-4 text-green-500" />;
      case 'queued': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing': return 'bg-green-100 text-green-800 border-green-200';
      case 'queued': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ScaleCraft
                </h1>
                <p className="text-xs text-slate-500">Production Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="designs" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Designs
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">3</div>
                  <p className="text-xs text-slate-500">+1 from yesterday</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Completed Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">12</div>
                  <p className="text-xs text-slate-500">85% success rate</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Design Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">24</div>
                  <p className="text-xs text-slate-500">3 updated today</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Marketplace Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">68</div>
                  <p className="text-xs text-slate-500">+12 this hour</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your production workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium text-slate-900">{job.name}</p>
                        <p className="text-sm text-slate-500">{job.printer} • {job.material}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Design Library</h2>
                <p className="text-slate-600">Manage your CAD files and templates</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Design
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDesigns.map((design) => (
                <Card key={design.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{design.name}</CardTitle>
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <CardDescription>{design.version} • {design.lastModified}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* TODO: Implement design file management features */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Design Management Coming Soon</h3>
                <p className="text-slate-600 mb-4">Advanced CAD file personalization and batch processing features will be available here.</p>
                <Badge variant="outline">Under Development</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Production Jobs</h2>
                <p className="text-slate-600">Monitor and manage your print queue</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Play className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </div>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle>Job Queue</CardTitle>
                <CardDescription>Current and recent production jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJobs.map((job, index) => (
                    <div key={job.id}>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(job.status)}
                          <div>
                            <h4 className="font-medium text-slate-900">{job.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>{job.printer}</span>
                              <span>•</span>
                              <span>{job.material}</span>
                              {job.progress > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{job.progress}% complete</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          {job.status === 'printing' && (
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < mockJobs.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* TODO: Implement job management features */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Advanced Job Management</h3>
                <p className="text-slate-600 mb-4">Batch processing, automated scheduling, and production analytics will be available here.</p>
                <Badge variant="outline">Under Development</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Marketplace Integrations</h2>
                <p className="text-slate-600">Connect to online marketplaces and automate order processing</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
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
                  {mockMarketplaces.map((marketplace) => (
                    <div key={marketplace.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{marketplace.icon}</span>
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
                        <Button size="sm" variant="outline">
                          <Sync className="h-3 w-3 mr-1" />
                          Sync Now
                        </Button>
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
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Auto-create print jobs</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <p className="text-sm text-green-700">Automatically create print jobs when new orders are received</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Parameter mapping</h4>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <p className="text-sm text-blue-700">Map order customization data to CAD parameters</p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-900">Order notifications</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <p className="text-sm text-yellow-700">Send notifications when orders require manual review</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
