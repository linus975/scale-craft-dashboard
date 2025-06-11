
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCADIntegrations } from '@/hooks/useCADIntegrations';

interface CADConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CADConnectionDialog: React.FC<CADConnectionDialogProps> = ({ isOpen, onClose }) => {
  const { integrations, createIntegration, loading } = useCADIntegrations();
  const [activeTab, setActiveTab] = useState('fusion360');
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: ''
  });

  const cadPrograms = [
    {
      id: 'fusion360',
      name: 'Fusion 360',
      icon: '🔧'
    },
    {
      id: 'solidworks',
      name: 'SolidWorks',
      icon: '⚙️'
    }
  ];

  const getIntegrationForProgram = (programId: string) => {
    return integrations.find(integration => integration.program_type === programId);
  };

  const handleConnect = async (programId: string) => {
    try {
      await createIntegration({
        program_type: programId,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        name: cadPrograms.find(p => p.id === programId)?.name || programId
      });
      
      setCredentials({ clientId: '', clientSecret: '' });
    } catch (error) {
      console.error('Error connecting CAD program:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskSecret = (secret: string) => {
    return '*'.repeat(secret.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>CAD-Programme verbinden</DialogTitle>
          <DialogDescription>
            Verbinden Sie Ihre CAD-Programme für nahtlose Design-Integration
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {cadPrograms.map((program) => (
              <TabsTrigger key={program.id} value={program.id} className="flex items-center gap-2">
                <span>{program.icon}</span>
                {program.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {cadPrograms.map((program) => {
            const integration = getIntegrationForProgram(program.id);
            
            return (
              <TabsContent key={program.id} value={program.id} className="space-y-4 mt-6">
                {!integration ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${program.id}-client-id`}>Client ID</Label>
                      <Input
                        id={`${program.id}-client-id`}
                        value={credentials.clientId}
                        onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                        placeholder="Geben Sie Ihre Client ID ein"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${program.id}-client-secret`}>Client Secret</Label>
                      <Input
                        id={`${program.id}-client-secret`}
                        type="password"
                        value={credentials.clientSecret}
                        onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                        placeholder="Geben Sie Ihr Client Secret ein"
                      />
                    </div>

                    <Button 
                      onClick={() => handleConnect(program.id)}
                      disabled={!credentials.clientId || !credentials.clientSecret || loading}
                      className="w-full"
                    >
                      {loading ? 'Verbinde...' : 'Jetzt verbinden'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-3">Verbindung hergestellt</h3>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm text-gray-600">Client ID</Label>
                          <p className="font-mono text-sm">{integration.client_id}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Client Secret</Label>
                          <p className="font-mono text-sm">{maskSecret(integration.client_secret || '')}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Zuletzt verbunden</Label>
                          <p className="text-sm">{formatDate(integration.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CADConnectionDialog;
