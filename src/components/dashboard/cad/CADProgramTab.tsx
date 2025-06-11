
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import CADConnectionSection from './CADConnectionSection';

interface CADIntegration {
  id: string;
  user_id: string;
  program_type: string | null;
  name: string | null;
  client_id: string;
  client_secret?: string;
  status: string;
  token_expires_in?: number;
  token_type?: string;
  refresh_token?: string;
  access_token?: string;
  created_at: string;
  updated_at: string;
}

interface CADProgram {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CADProgramTabProps {
  program: CADProgram;
  integrations: CADIntegration[];
  onConnect: (programId: string) => void;
  onDeleteIntegration: (integrationId: string) => void;
  deleting: string | null;
  loading: boolean;
}

const CADProgramTab: React.FC<CADProgramTabProps> = ({
  program,
  integrations,
  onConnect,
  onDeleteIntegration,
  deleting,
  loading
}) => {
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

  return (
    <TabsContent value={program.id} className="space-y-4 mt-6">
      {integrations.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <span>{program.icon}</span>
            {program.name} Connections
            <Badge variant="outline">{integrations.length}</Badge>
          </h3>
          
          <div className="space-y-3">
            {integrations.map((integration, index) => (
              <Card key={integration.id} className="border-l-4" style={{ borderLeftColor: program.color }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{program.icon}</span>
                      <div>
                        <h4 className="font-medium text-sm">
                          {integration.name || `${program.name} Connection #${index + 1}`}
                        </h4>
                        <Badge 
                          variant={integration.status === 'connected' ? 'default' : 'secondary'}
                          className={`text-xs ${integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {integration.status === 'connected' ? '✅ Connected' : '⚠️ ' + integration.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-500">
                        {formatDate(integration.created_at)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteIntegration(integration.id)}
                        disabled={deleting === integration.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        {deleting === integration.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-gray-600 font-medium text-xs">Client ID</Label>
                      <p className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                        {integration.client_id || 'Not set'}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600 font-medium text-xs">Client Secret</Label>
                      <p className="font-mono text-xs bg-gray-50 p-2 rounded mt-1">
                        {maskSecret(integration.client_secret)}
                      </p>
                    </div>

                    {integration.access_token && (
                      <div className="md:col-span-2">
                        <Label className="text-gray-600 font-medium text-xs">Status</Label>
                        <p className="text-xs bg-green-50 p-2 rounded mt-1 text-green-700">
                          🔐 Token available - Connection active
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <CADConnectionSection
            programIcon={program.icon}
            programName={program.name}
            programId={program.id}
            programColor={program.color}
            onConnect={onConnect}
            loading={loading}
            isAddNew={true}
          />
        </div>
      ) : (
        <CADConnectionSection
          programIcon={program.icon}
          programName={program.name}
          programId={program.id}
          programColor={program.color}
          onConnect={onConnect}
          loading={loading}
          isAddNew={false}
        />
      )}
    </TabsContent>
  );
};

export default CADProgramTab;
