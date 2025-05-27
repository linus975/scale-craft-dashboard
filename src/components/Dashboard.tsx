
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, 
  LogOut, 
  Settings, 
  Layers, 
  User,
  Monitor,
  ShoppingCart,
  Printer
} from 'lucide-react';
import OverviewTab from './dashboard/OverviewTab';
import DesignsTab from './dashboard/DesignsTab';
import JobsTab from './dashboard/JobsTab';
import MarketplaceTab from './dashboard/MarketplaceTab';
import MachinesTab from './dashboard/MachinesTab';

interface DashboardProps {
  user: { email: string };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");

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
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="designs" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Designs
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Machines
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="marketplace">
            <MarketplaceTab />
          </TabsContent>

          <TabsContent value="designs">
            <DesignsTab />
          </TabsContent>

          <TabsContent value="machines">
            <MachinesTab />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
