import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCADIntegrations } from '@/hooks/useCADIntegrations';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CADConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CADConnectionDialog: React.FC<CADConnectionDialogProps> = ({ isOpen, onClose }) => {
  const { integrations, handleConnect, loading, refetch } = useCADIntegrations();
  const [activeTab, setActiveTab] = useState('fusion360');
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Refetch data when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 CAD Dialog opened, refetching integrations...');
      refetch();
    }
  }, [isOpen, refetch]);

  // Debug log for integrations
  useEffect(() => {
    console.log('🔧 CAD Integrations data:', integrations);
    console.log('📊 Total integrations count:', integrations?.length || 0);
  }, [integrations]);

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
    const programIntegrations = integrations.filter(integration => 
      integration.program_type === programId || 
      (programId === 'fusion360' && integration.program_type === null && integration.client_id?.includes('autodesk'))
    );
    console.log(`🔍 Integrations for ${programId}:`, programIntegrations);
    return programIntegrations;
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    setDeleting(integrationId);
    try {
      const { error } = await supabase
        .from('cad_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Integration deleted",
        description: "CAD integration has been successfully removed.",
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Error deleting integration",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
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

  const maskSecret = (secret?: string) => {
    if (!secret) return 'Not set';
    return '*'.repeat(Math.min(secret.length, 12));
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage CAD Programs</DialogTitle>
            <DialogDescription>
              Loading CAD integrations...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage CAD Programs</DialogTitle>
          <DialogDescription>
            Connect and manage your CAD programs for seamless design integration
            {integrations.length > 0 && (
              <span className="block mt-1 text-sm text-green-600">
                ✅ {integrations.length} integration(s) found
              </span>
            )}
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
                {getIntegrationsForProgram(program.id).length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getIntegrationsForProgram(program.id).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {cadPrograms.map((program) => {
            const programIntegrations = getIntegrationsForProgram(program.id);
            
            return (
              <TabsContent key={program.id} value={program.id} className="space-y-4 mt-6">
                {programIntegrations.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <span>{program.icon}</span>
                      {program.name} Connections
                      <Badge variant="outline">{programIntegrations.length}</Badge>
                    </h3>
                    
                    {programIntegrations.map((integration, index) => (
                      <Card key={integration.id} className="border-l-4" style={{ borderLeftColor: program.color }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{program.icon}</span>
                              <div>
                                <h4 className="font-medium">
                                  {integration.name || `${program.name} Connection #${index + 1}`}
                                </h4>
                                <Badge 
                                  variant={integration.status === 'connected' ? 'default' : 'secondary'}
                                  className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                                >
                                  {integration.status === 'connected' ? '✅ Connected' : '⚠️ ' + integration.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-gray-500">
                                Created: {formatDate(integration.created_at)}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteIntegration(integration.id)}
                                disabled={deleting === integration.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deleting === integration.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-gray-600 font-medium">Client ID</Label>
                              <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 break-all">
                                {integration.client_id || 'Not set'}
                              </p>
                            </div>
                            
                            <div>
                              <Label className="text-gray-600 font-medium">Client Secret</Label>
                              <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">
                                {maskSecret(integration.client_secret)}
                              </p>
                            </div>

                            {integration.access_token && (
                              <div className="md:col-span-2">
                                <Label className="text-gray-600 font-medium">Status</Label>
                                <p className="text-sm bg-green-50 p-2 rounded mt-1 text-green-700">
                                  🔐 Token available - Connection active
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Add new connection button when integrations exist */}
                    <div className="pt-4 border-t">
                      <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
                        <span className="text-4xl">{program.icon}</span>
                        <h4 className="font-medium text-gray-900">
                          Add New {program.name} Connection
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Add another {program.name} connection for additional integrations
                        </p>
                        <Button 
                          onClick={() => handleConnect(program.id)}
                          disabled={loading}
                          className="w-full max-w-xs text-white"
                          style={{ backgroundColor: program.color }}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Connecting...
                            </>
                          ) : (
                            '➕ Add New Connection'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Show connect new section when no integrations exist */
                  <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
                    <span className="text-4xl">{program.icon}</span>
                    <h4 className="font-medium text-gray-900">
                      Connect {program.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Connect {program.name} for enhanced design integration
                    </p>
                    <Button 
                      onClick={() => handleConnect(program.id)}
                      disabled={loading}
                      className="w-full max-w-xs text-white"
                      style={{ backgroundColor: program.color }}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </>
                      ) : (
                        `🔗 Connect ${program.name}`
                      )}
                    </Button>
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
