
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus,
  Printer,
  Wifi,
  WifiOff,
  Settings,
  Trash2,
  Activity,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import MachineStatisticsPage from './MachineStatisticsPage';
import MachineConfigDialog from './MachineConfigDialog';

const MachinesTab: React.FC = () => {
  const [isAddMachineDialogOpen, setIsAddMachineDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'statistics'>('main');
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    connectionType: '',
    apiUrl: '',
    apiKey: '',
    username: '',
    password: ''
  });

  if (currentView === 'statistics') {
    return <MachineStatisticsPage onBack={() => setCurrentView('main')} />;
  }

  const mockMachines = [
    { 
      id: 1, 
      name: "Prusa i3 MK3S+", 
      type: "FDM", 
      status: "idle", 
      connection: "OctoPrint", 
      lastSeen: "2 minutes ago",
      currentJob: null,
      connectionType: "octoprint",
      apiUrl: "http://octopi.local",
      apiKey: "****",
      username: ""
    },
    { 
      id: 2, 
      name: "Bambu Lab X1 Carbon", 
      type: "FDM", 
      status: "printing", 
      connection: "Bambu API", 
      lastSeen: "1 minute ago",
      currentJob: "Custom Phone Case - 45% complete",
      connectionType: "bambu",
      apiUrl: "https://api.bambulab.com",
      apiKey: "****",
      username: "user@example.com"
    },
    { 
      id: 3, 
      name: "Ender 3 V2", 
      type: "FDM", 
      status: "offline", 
      connection: "OctoPrint", 
      lastSeen: "2 hours ago",
      currentJob: null,
      connectionType: "octoprint",
      apiUrl: "http://192.168.1.100",
      apiKey: "****",
      username: ""
    }
  ];

  const mockDesigns = [
    { id: 1, name: "Parametric Gear" },
    { id: 2, name: "Custom Bracket" },
    { id: 3, name: "Housing Template" }
  ];

  const mockQueueJobs = [
    { id: 1, filename: "phone_case_v2.gcode", customer: "John Doe" },
    { id: 2, filename: "bracket_custom.gcode", customer: "Jane Smith" },
    { id: 3, filename: "gear_set.gcode", customer: "Mike Johnson" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding machine:', formData);
    // TODO: Implement machine addition logic
    setIsAddMachineDialogOpen(false);
    setFormData({
      name: '',
      type: '',
      connectionType: '',
      apiUrl: '',
      apiKey: '',
      username: '',
      password: ''
    });
  };

  const handleMachineConfigSave = (machineData: any) => {
    console.log('Saving machine configuration:', machineData);
    // TODO: Implement machine configuration save logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-100 text-green-800 border-green-200';
      case 'printing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return <Wifi className="h-4 w-4" />;
      case 'printing': return <Activity className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Machine Parc</h2>
          <p className="text-slate-600">Manage your connected 3D printers and monitor their status</p>
        </div>
        <Dialog open={isAddMachineDialogOpen} onOpenChange={setIsAddMachineDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add 3D Printer</DialogTitle>
              <DialogDescription>
                Connect a new 3D printer via API or OctoPrint
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Machine Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Prusa i3 MK3S+"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Printer Type</Label>
                <Select onValueChange={(value) => handleInputChange('type', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select printer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fdm">FDM</SelectItem>
                    <SelectItem value="sla">SLA/Resin</SelectItem>
                    <SelectItem value="sls">SLS</SelectItem>
                    <SelectItem value="endless-printing">Endless Printing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectionType">Connection Type</Label>
                <Select onValueChange={(value) => handleInputChange('connectionType', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="octoprint">OctoPrint</SelectItem>
                    <SelectItem value="bambu">Bambu Lab API</SelectItem>
                    <SelectItem value="prusa">Prusa Connect</SelectItem>
                    <SelectItem value="custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  placeholder="http://octopi.local or API endpoint"
                  value={formData.apiUrl}
                  onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                  required
                />
              </div>

              {formData.connectionType === 'octoprint' ? (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="OctoPrint API Key"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddMachineDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Machine
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Machine Statistics Link */}
      <Card 
        className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setCurrentView('statistics')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Machine Statistics</h3>
                <p className="text-slate-600">View detailed analytics and performance metrics</p>
              </div>
            </div>
            <ExternalLink className="h-5 w-5 text-slate-400" />
          </div>
        </CardContent>
      </Card>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMachines.map((machine) => (
          <Card 
            key={machine.id} 
            className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedMachine(machine)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Printer className="h-5 w-5 text-slate-400" />
                  <div>
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    <CardDescription>{machine.type} • {machine.connection}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(machine.status)}>
                  {getStatusIcon(machine.status)}
                  <span className="ml-1 capitalize">{machine.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {machine.currentJob && (
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-900 font-medium">Current Job:</p>
                    <p className="text-sm text-blue-700">{machine.currentJob}</p>
                  </div>
                )}
                <p className="text-sm text-slate-500">Last seen: {machine.lastSeen}</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMachine(machine);
                    }}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Machine Configuration Dialog */}
      {selectedMachine && (
        <MachineConfigDialog
          machine={selectedMachine}
          isOpen={!!selectedMachine}
          onClose={() => setSelectedMachine(null)}
          onSave={handleMachineConfigSave}
          designs={mockDesigns}
          queueJobs={mockQueueJobs}
        />
      )}
    </div>
  );
};

export default MachinesTab;
