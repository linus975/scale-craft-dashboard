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
  ExternalLink,
  Loader2
} from 'lucide-react';
import MachineStatisticsPage from './MachineStatisticsPage';
import MachineConfigDialog from './MachineConfigDialog';
import { useMachines } from '@/hooks/useMachines';

const MachinesTab: React.FC = () => {
  const [isAddMachineDialogOpen, setIsAddMachineDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'statistics'>('main');
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    printer_type: '',
    connection_type: '',
    api_url: '',
    api_key: '',
    username: ''
  });

  const { machines, loading, createMachine, updateMachine, deleteMachine, refetch } = useMachines();

  if (currentView === 'statistics') {
    return <MachineStatisticsPage onBack={() => setCurrentView('main')} />;
  }

  // Mock data for designs and queue jobs (will be replaced with real data later)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const machineData: any = {
        name: formData.name,
        printer_type: formData.printer_type,
        connection_type: formData.connection_type,
        api_url: formData.api_url,
        username: formData.username,
        api_key: formData.api_key // Always store in api_key field
      };

      await createMachine(machineData);
      setIsAddMachineDialogOpen(false);
      setFormData({
        name: '',
        printer_type: '',
        connection_type: '',
        api_url: '',
        api_key: '',
        username: ''
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleMachineConfigSave = async (machineData: any) => {
    try {
      await updateMachine(machineData.id, {
        name: machineData.name,
        printer_type: machineData.type,
        connection_type: machineData.connectionType,
        api_url: machineData.apiUrl,
        api_key: machineData.apiKey,
        username: machineData.username
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteMachine = async (machineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Do you really want to delete this machine?')) {
      try {
        await deleteMachine(machineId);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleMachineConfigClose = () => {
    setSelectedMachine(null);
    // Refresh machines to show updated status after potential job claiming
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'idle': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'busy': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_configuration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Wifi className="h-4 w-4" />;
      case 'idle': return <Wifi className="h-4 w-4" />;
      case 'busy': return <Wifi className="h-4 w-4" />;
      case 'paused': return <Wifi className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'needs_configuration': return <Settings className="h-4 w-4" />;
      case 'error': return <WifiOff className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'idle': return 'Idle';
      case 'busy': return 'Busy';
      case 'paused': return 'Paused';
      case 'offline': return 'Offline';
      case 'needs_configuration': return 'Configuration Required';
      case 'error': return 'Error';
      default: return status;
    }
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never connected';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Machine Fleet</h2>
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
                  placeholder="e.g. Prusa i3 MK3S+"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="printer_type">Printer Type</Label>
                <Select onValueChange={(value) => handleInputChange('printer_type', value)} required>
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
                <Label htmlFor="connection_type">Connection Type</Label>
                <Select onValueChange={(value) => handleInputChange('connection_type', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="octoprint">OctoPrint</SelectItem>
                    <SelectItem value="prusalink">PrusaLink</SelectItem>
                    <SelectItem value="bambu">Bambu Lab API</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_url">Printer URL</Label>
                <Input
                  id="api_url"
                  placeholder="http://octopi.local or API endpoint"
                  value={formData.api_url}
                  onChange={(e) => handleInputChange('api_url', e.target.value)}
                />
              </div>

              {formData.connection_type === 'octoprint' ? (
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="OctoPrint API Key"
                    value={formData.api_key}
                    onChange={(e) => handleInputChange('api_key', e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">API User</Label>
                    <Input
                      id="username"
                      placeholder="API Username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_key_input">API Key</Label>
                    <Input
                      id="api_key_input"
                      type="password"
                      placeholder="API Key"
                      value={formData.api_key}
                      onChange={(e) => handleInputChange('api_key', e.target.value)}
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Machine Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Printer className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No machines found</h3>
              <p className="text-slate-600 mb-4">Add your first 3D printer to get started.</p>
              <Button 
                onClick={() => setIsAddMachineDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Machine
              </Button>
            </div>
          ) : (
            machines.map((machine) => (
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
                        <CardDescription>{machine.printer_type?.toUpperCase()} • {machine.connection_type}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(machine.status)}>
                      {getStatusIcon(machine.status)}
                      <span className="ml-1">{getStatusText(machine.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {machine.current_job_id && machine.current_job_name && (
                      <div className="p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-900 font-medium">Current Job:</p>
                        <p className="text-sm text-blue-700 truncate" title={machine.current_job_name}>
                          {machine.current_job_name}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-slate-500">Last seen: {formatLastSeen(machine.last_seen)}</p>
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => handleDeleteMachine(machine.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Machine Configuration Dialog */}
      {selectedMachine && (
        <MachineConfigDialog
          machine={{
            id: selectedMachine.id,
            name: selectedMachine.name,
            type: selectedMachine.printer_type,
            status: selectedMachine.status,
            connection: selectedMachine.connection_type,
            lastSeen: formatLastSeen(selectedMachine.last_seen),
            currentJob: selectedMachine.current_job_name || null,
            current_job_name: selectedMachine.current_job_name,
            connectionType: selectedMachine.connection_type,
            apiUrl: selectedMachine.api_url || '',
            apiKey: selectedMachine.api_key || '',
            username: selectedMachine.username || ''
          }}
          isOpen={!!selectedMachine}
          onClose={handleMachineConfigClose}
          onSave={handleMachineConfigSave}
          designs={mockDesigns}
          queueJobs={mockQueueJobs}
        />
      )}
    </div>
  );
};

export default MachinesTab;
