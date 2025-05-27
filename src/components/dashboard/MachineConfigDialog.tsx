import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Play, ListPlus } from 'lucide-react';

interface Machine {
  id: number;
  name: string;
  type: string;
  status: string;
  connection: string;
  lastSeen: string;
  currentJob: string | null;
  apiUrl?: string;
  apiKey?: string;
  username?: string;
  connectionType?: string;
}

interface MachineConfigDialogProps {
  machine: Machine;
  isOpen: boolean;
  onClose: () => void;
  onSave: (machineData: any) => void;
  designs: any[];
  queueJobs: any[];
}

const MachineConfigDialog: React.FC<MachineConfigDialogProps> = ({ 
  machine, 
  isOpen, 
  onClose, 
  onSave,
  designs,
  queueJobs 
}) => {
  const [formData, setFormData] = useState({
    name: machine.name,
    type: machine.type,
    connectionType: machine.connectionType || 'octoprint',
    apiUrl: machine.apiUrl || '',
    apiKey: machine.apiKey || '',
    username: machine.username || '',
    password: ''
  });
  
  const [selectedNextJob, setSelectedNextJob] = useState('');
  const [jobSource, setJobSource] = useState<'queue' | 'design'>('queue');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: machine.id });
    onClose();
  };

  const handleStartNextJob = () => {
    console.log(`Starting next job: ${selectedNextJob} from ${jobSource}`);
    // TODO: Implement job start logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-100 text-green-800 border-green-200';
      case 'printing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {machine.name}
          </DialogTitle>
          <DialogDescription>
            Update machine settings and manage current operations
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Machine Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Machine Type</Label>
                  <Select onValueChange={(value) => handleInputChange('type', value)} value={formData.type}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Select onValueChange={(value) => handleInputChange('connectionType', value)} value={formData.connectionType}>
                    <SelectTrigger>
                      <SelectValue />
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
                    value={formData.apiUrl}
                    onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                    placeholder="http://octopi.local or API endpoint"
                  />
                </div>

                {formData.connectionType === 'octoprint' ? (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="OctoPrint API Key"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Configuration
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Current Status & Job Management */}
          <div className="space-y-4">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status:</span>
                    <Badge className={getStatusColor(machine.status)}>
                      {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Last Seen:</span>
                    <span className="text-sm">{machine.lastSeen}</span>
                  </div>
                  {machine.currentJob && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium">Current Job:</p>
                      <p className="text-sm text-blue-700">{machine.currentJob}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Job Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Next Job</CardTitle>
                <CardDescription>Select next job to print</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Job Source</Label>
                    <Select onValueChange={(value: 'queue' | 'design') => setJobSource(value)} value={jobSource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="queue">From Queue</SelectItem>
                        <SelectItem value="design">From Designs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Job/Design</Label>
                    <Select onValueChange={setSelectedNextJob} value={selectedNextJob}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose job or design" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobSource === 'queue' ? (
                          queueJobs.map((job) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                              {job.filename} - {job.customer}
                            </SelectItem>
                          ))
                        ) : (
                          designs.map((design) => (
                            <SelectItem key={design.id} value={design.id.toString()}>
                              {design.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleStartNextJob} 
                    disabled={!selectedNextJob}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Next Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MachineConfigDialog;
