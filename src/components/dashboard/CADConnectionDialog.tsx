
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCADIntegrations } from '@/hooks/useCADIntegrations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CADProgramTab from './cad/CADProgramTab';

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
              <CADProgramTab
                key={program.id}
                program={program}
                integrations={programIntegrations}
                onConnect={handleConnect}
                onDeleteIntegration={handleDeleteIntegration}
                deleting={deleting}
                loading={loading}
              />
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CADConnectionDialog;
