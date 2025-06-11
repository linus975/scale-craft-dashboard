
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

  const getIntegrationForProgram = (programId: string) => {
    return integrations.find(integration => integration.program_type === programId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
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

  const getActiveProgram = () => {
    return cadPrograms.find(program => program.id === activeTab);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect CAD Programs</DialogTitle>
          <DialogDescription>
            Connect your CAD programs for seamless design integration
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
            const integration = getIntegrationForProgram(program.id);
            
            return (
              <TabsContent key={program.id} value={program.id} className="space-y-4 mt-6">
                {!integration ? (
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Connect {program.name} for enhanced design integration
                    </p>
                    <Button 
                      onClick={() => handleConnect(program.id)}
                      disabled={loading}
                      className="w-full"
                      style={{ backgroundColor: program.color }}
                    >
                      Connect Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-3">Connection Established</h3>
                      
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
                          <Label className="text-sm text-gray-600">Last Connected</Label>
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
