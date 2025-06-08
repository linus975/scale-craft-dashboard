import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Play, ListPlus, Loader2, Bug, Zap } from 'lucide-react';
import { useJobClaiming } from '@/hooks/useJobClaiming';
import { useJobClaimingDebug } from '@/hooks/useJobClaimingDebug';
import { useJobAssignment } from '@/hooks/useJobAssignment';

interface Machine {
  id: number | string;
  name: string;
  type: string;
  status: string;
  connection: string;
  lastSeen: string;
  currentJob: string | null;
  current_job_name?: string | null;
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
  const { claimNextJob, claiming } = useJobClaiming();
  const { debugJobClaiming, debugging } = useJobClaimingDebug();
  const { assignNextJob, assigning } = useJobAssignment();

  // Determine the display value for API key
  const getApiKeyDisplayValue = () => {
    if (machine.apiKey && machine.apiKey.trim() !== '') {
      return '********************';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    name: machine.name,
    type: machine.type,
    connectionType: machine.connectionType || 'octoprint',
    apiUrl: machine.apiUrl || '',
    apiKey: getApiKeyDisplayValue(),
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
    const submitData = { ...formData, id: machine.id };
    
    // If API key field shows asterisks and wasn't changed, don't include it in update
    if (formData.apiKey === '********************') {
      delete submitData.apiKey;
    }
    
    onSave(submitData);
    onClose();
  };

  const handleStartNextJob = () => {
    console.log(`Starting next job: ${selectedNextJob} from ${jobSource}`);
    // TODO: Implement job start logic
  };

  const handleClaimNextJob = async () => {
    const result = await claimNextJob(machine.id.toString());
    if (result) {
      // Refresh the parent component to show the updated machine status
      onClose();
      // You might want to trigger a refetch of machines here
    }
  };

  const handleAssignNextJob = async () => {
    const result = await assignNextJob(machine.id.toString());
    if (result) {
      // Refresh the parent component to show the updated machine status
      onClose();
      // You might want to trigger a refetch of machines here
    }
  };

  const handleDebugClaiming = async () => {
    await debugJobClaiming(machine.id.toString());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_configuration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'offline': return 'Offline';
      case 'needs_configuration': return 'Configuration Required';
      case 'error': return 'Error';
      default: return status;
    }
  };

  // Check if API key exists in database
  const hasApiKey = machine.apiKey && machine.apiKey.trim() !== '';

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
                      <SelectItem value="prusalink">PrusaLink</SelectItem>
                      <SelectItem value="bambu">Bambu Lab API</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiUrl">Printer URL</Label>
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
                      placeholder={hasApiKey ? "Current key stored" : "No Key"}
                      className={!hasApiKey ? "text-gray-400" : ""}
                    />
                    {!hasApiKey && (
                      <p className="text-sm text-gray-500">No API key stored</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">API User</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">API Key</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => handleInputChange('apiKey', e.target.value)}
                        placeholder={hasApiKey ? "Current key stored" : "No Key"}
                        className={!hasApiKey ? "text-gray-400" : ""}
                      />
                      {!hasApiKey && (
                        <p className="text-sm text-gray-500">No API key stored</p>
                      )}
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
                      {getStatusText(machine.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Last seen:</span>
                    <span className="text-sm">{machine.lastSeen}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Machine ID:</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{machine.id}</span>
                  </div>
                  {machine.current_job_name && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium">Current Job:</p>
                      <p className="text-sm text-blue-700">{machine.current_job_name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Queue Management */}
            <Card>
              <CardHeader>
                <CardTitle>Job Management</CardTitle>
                <CardDescription>Claim jobs from the queue automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={handleClaimNextJob}
                    disabled={claiming || machine.status === 'busy'}
                    className="w-full"
                  >
                    {claiming ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Claiming Job...
                      </>
                    ) : (
                      <>
                        <ListPlus className="h-4 w-4 mr-2" />
                        Claim Next Ready Job
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleAssignNextJob}
                    disabled={assigning || machine.status === 'busy'}
                    variant="secondary"
                    className="w-full"
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assigning Job...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Assign Next Job (Alternative)
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleDebugClaiming}
                    disabled={debugging}
                    variant="outline"
                    className="w-full"
                  >
                    {debugging ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Debugging...
                      </>
                    ) : (
                      <>
                        <Bug className="h-4 w-4 mr-2" />
                        Debug Job Claiming
                      </>
                    )}
                  </Button>
                  
                  {machine.status === 'busy' && (
                    <p className="text-sm text-slate-500 text-center">
                      Machine is currently busy with a job
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Manual Job Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Job Selection</CardTitle>
                <CardDescription>Manually select next job to print</CardDescription>
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
                        <SelectValue placeholder="Select job or design" />
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
                    variant="outline"
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Selected Job
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
