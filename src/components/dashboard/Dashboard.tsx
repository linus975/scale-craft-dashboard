import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Cpu, 
  LogOut, 
  Settings, 
  Layers, 
  User,
  Monitor,
  ShoppingCart,
  Printer,
  BookOpen,
  Package,
  Menu
} from 'lucide-react';
import OverviewTab from './OverviewTab';
import DesignsTab from './DesignsTab';
import JobsTab from './JobsTab';
import MarketplaceTab from './MarketplaceTab';
import MachinesTab from './MachinesTab';
import KnowledgeBaseTab from './KnowledgeBaseTab';
import ShippingTab from './ShippingTab';
import BusinessMetricsPage from './BusinessMetricsPage';
import SystemLogPage from './SystemLogPage';
import DesignDetailPage from './DesignDetailPage';
import WhitelabelCatalogPage from './WhitelabelCatalogPage';
import RecentOrdersPage from './RecentOrdersPage';
import AllOrdersPage from './AllOrdersPage';

interface DashboardProps {
  user: { email: string };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBusinessMetrics, setShowBusinessMetrics] = useState(false);
  const [showSystemLog, setShowSystemLog] = useState(false);
  const [showDesignDetail, setShowDesignDetail] = useState<string | null>(null);
  const [showWhitelabelCatalog, setShowWhitelabelCatalog] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  const handleBusinessMetricsNavigation = () => {
    setShowBusinessMetrics(true);
  };

  const handleSystemLogNavigation = () => {
    setShowSystemLog(true);
  };

  const handleActiveJobsNavigation = () => {
    setActiveTab("jobs");
    // This will be handled by JobsTab to show active jobs view
  };

  const handleWhitelabelCatalogNavigation = () => {
    setShowWhitelabelCatalog(true);
  };

  const handleRecentOrdersNavigation = () => {
    setShowRecentOrders(true);
  };

  const handleAllOrdersNavigation = () => {
    setShowAllOrders(true);
  };

  const handleBackToOverview = () => {
    setShowBusinessMetrics(false);
    setShowSystemLog(false);
    setShowDesignDetail(null);
    setShowWhitelabelCatalog(false);
    setShowRecentOrders(false);
    setShowAllOrders(false);
  };

  const handleDesignDetailNavigation = (designId: string) => {
    setShowDesignDetail(designId);
  };

  const handleMachinesNavigation = () => {
    setActiveTab("machines");
  };

  const handleCompletedJobsNavigation = () => {
    setActiveTab("jobs");
    // This will be handled by JobsTab to show completed jobs view
  };

  const tabItems = [
    { value: "overview", label: "Overview", icon: Monitor },
    { value: "marketplace", label: "Marketplace", icon: ShoppingCart },
    { value: "designs", label: "Designs", icon: Layers },
    { value: "jobs", label: "QueueBoard", icon: Settings },
    { value: "machines", label: "Machines", icon: Printer },
    { value: "shipping", label: "Shipping", icon: Package },
    { value: "knowledge", label: "Knowledge Base", icon: BookOpen },
  ];

  const currentTabItem = tabItems.find(item => item.value === activeTab);

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
        {showBusinessMetrics ? (
          <BusinessMetricsPage onBack={handleBackToOverview} />
        ) : showSystemLog ? (
          <SystemLogPage onBack={handleBackToOverview} />
        ) : showDesignDetail ? (
          <DesignDetailPage designId={showDesignDetail} onBack={handleBackToOverview} />
        ) : showWhitelabelCatalog ? (
          <WhitelabelCatalogPage onBack={handleBackToOverview} />
        ) : showRecentOrders ? (
          <RecentOrdersPage onBack={handleBackToOverview} />
        ) : showAllOrders ? (
          <AllOrdersPage onBack={handleBackToOverview} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Desktop Navigation */}
            <TabsList className="hidden lg:grid w-full grid-cols-7 lg:w-fit lg:grid-cols-7 mb-8">
              {tabItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden mb-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      {currentTabItem && (
                        <currentTabItem.icon className="h-4 w-4" />
                      )}
                      {currentTabItem?.label}
                    </div>
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white border border-slate-200 shadow-md">
                  {tabItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.value} 
                      onClick={() => setActiveTab(item.value)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <TabsContent value="overview">
              <OverviewTab 
                onNavigateToBusinessMetrics={handleBusinessMetricsNavigation}
                onNavigateToSystemLog={handleSystemLogNavigation}
                onNavigateToMachines={handleMachinesNavigation}
                onNavigateToCompletedJobs={handleCompletedJobsNavigation}
                onNavigateToActiveJobs={handleActiveJobsNavigation}
                onNavigateToRecentOrders={handleRecentOrdersNavigation}
                onNavigateToAllOrders={handleAllOrdersNavigation}
              />
            </TabsContent>

            <TabsContent value="marketplace">
              <MarketplaceTab onNavigateToAllOrders={handleAllOrdersNavigation} />
            </TabsContent>

            <TabsContent value="designs">
              <DesignsTab 
                onNavigateToDesignDetail={handleDesignDetailNavigation}
                onNavigateToWhitelabelCatalog={handleWhitelabelCatalogNavigation}
              />
            </TabsContent>

            <TabsContent value="jobs">
              <JobsTab />
            </TabsContent>

            <TabsContent value="machines">
              <MachinesTab />
            </TabsContent>

            <TabsContent value="shipping">
              <ShippingTab />
            </TabsContent>

            <TabsContent value="knowledge">
              <KnowledgeBaseTab />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
