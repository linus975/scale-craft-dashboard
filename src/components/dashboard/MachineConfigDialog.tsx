
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
  id: number | string;
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
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_configuration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'offline': return 'Offline';
      case 'needs_configuration': return 'Konfiguration erforderlich';
      case 'error': return 'Fehler';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {machine.name} konfigurieren
          </DialogTitle>
          <DialogDescription>
            Maschineneinstellungen aktualisieren und aktuelle Vorgänge verwalten
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Maschinenkonfiguration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Maschinenname</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Maschinentyp</Label>
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
                  <Label htmlFor="connectionType">Verbindungstyp</Label>
                  <Select onValueChange={(value) => handleInputChange('connectionType', value)} value={formData.connectionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="octoprint">OctoPrint</SelectItem>
                      <SelectItem value="prusalink">PrusaLink</SelectItem>
                      <SelectItem value="bambu">Bambu Lab API</SelectItem>
                      <SelectItem value="manual">Manuell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiUrl">API-URL</Label>
                  <Input
                    id="apiUrl"
                    value={formData.apiUrl}
                    onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                    placeholder="http://octopi.local oder API-Endpunkt"
                  />
                </div>

                {formData.connectionType === 'octoprint' ? (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API-Schlüssel</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="OctoPrint API-Schlüssel"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Benutzername</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Passwort</Label>
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
                    Abbrechen
                  </Button>
                  <Button type="submit" className="flex-1">
                    Konfiguration speichern
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
                <CardTitle>Aktueller Status</CardTitle>
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
                    <span className="text-sm text-slate-600">Zuletzt gesehen:</span>
                    <span className="text-sm">{machine.lastSeen}</span>
                  </div>
                  {machine.currentJob && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium">Aktueller Job:</p>
                      <p className="text-sm text-blue-700">{machine.currentJob}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Job Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Nächster Job</CardTitle>
                <CardDescription>Nächsten zu druckenden Job auswählen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Job-Quelle</Label>
                    <Select onValueChange={(value: 'queue' | 'design') => setJobSource(value)} value={jobSource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="queue">Aus der Warteschlange</SelectItem>
                        <SelectItem value="design">Aus Designs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Job/Design auswählen</Label>
                    <Select onValueChange={setSelectedNextJob} value={selectedNextJob}>
                      <SelectTrigger>
                        <SelectValue placeholder="Job oder Design auswählen" />
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
                    Nächsten Job starten
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
