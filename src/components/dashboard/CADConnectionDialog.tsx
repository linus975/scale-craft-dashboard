import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCADIntegrations } from '@/hooks/useCADIntegrations';

interface CADConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CADConnectionDialog: React.FC<CADConnectionDialogProps> = ({ isOpen, onClose }) => {
  const { integrations, handleConnect, loading } = useCADIntegrations();
  const [activeTab, setActiveTab] = useState('fusion360');

  const cadPrograms = [
    {
      id: 'fusion360',
      name: 'Fusion 360',
      icon: '🔧',
      color: '#FF6A01'
    },
    {
      id: 'solidworks',
      name: 'SolidWorks',
      icon: '⚙️',
      color: '#F04E23'
    }
  ];

  const getIntegrationsForProgram = (programId: string) => {
    return integrations.filter(integration => integration.program_type === programId);
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

  const maskSecret = (secret?: string) => {
    if (!secret) return 'Not set';
    return '*'.repeat(Math.min(secret.length, 12));
  };

  const getActiveProgram = () => {
    return cadPrograms.find(program => program.id === activeTab);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CAD Programme verwalten</DialogTitle>
          <DialogDescription>
            Verbinden und verwalten Sie Ihre CAD Programme für nahtlose Design-Integration
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {cadPrograms.map((program) => (
              <TabsTrigger 
                key={program.id} 
                value={program.id} 
                className="flex items-center gap-2"
                style={activeTab === program.id ? { 
                  backgroundColor: program.color,
                  color: 'white'
                } : {}}
              >
                <span>{program.icon}</span>
                {program.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {cadPrograms.map((program) => {
            const programIntegrations = getIntegrationsForProgram(program.id);
            
            return (
              <TabsContent key={program.id} value={program.id} className="space-y-4 mt-6">
                {/* Existing Integrations */}
                {programIntegrations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bestehende Verbindungen</h3>
                    {programIntegrations.map((integration) => (
                      <Card key={integration.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{program.icon}</span>
                              <div>
                                <h4 className="font-medium">
                                  {integration.name || `${program.name} Connection`}
                                </h4>
                                <Badge 
                                  variant={integration.status === 'connected' ? 'default' : 'secondary'}
                                  className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {integration.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              Verbunden: {formatDate(integration.updated_at)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-gray-600">Client ID</Label>
                              <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">
                                {integration.client_id}
                              </p>
                            </div>
                            
                            <div>
                              <Label className="text-gray-600">Client Secret</Label>
                              <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">
                                {maskSecret(integration.client_secret)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Connect New Section */}
                <div className="pt-4 border-t">
                  <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">
                      {programIntegrations.length > 0 ? 'Neue Verbindung hinzufügen' : `${program.name} verbinden`}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {programIntegrations.length > 0 
                        ? `Fügen Sie eine weitere ${program.name} Verbindung hinzu`
                        : `Verbinden Sie ${program.name} für erweiterte Design-Integration`
                      }
                    </p>
                    <Button 
                      onClick={() => handleConnect(program.id)}
                      disabled={loading}
                      className="w-full max-w-xs"
                      style={{ backgroundColor: program.color }}
                    >
                      {programIntegrations.length > 0 ? 'Neue Verbindung' : 'Jetzt verbinden'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CADConnectionDialog;
