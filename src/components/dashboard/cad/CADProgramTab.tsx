
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X } from 'lucide-react';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditStart = (integration: CADIntegration) => {
    setEditingId(integration.id);
    setEditingName(integration.name || `${program.name} Connection #${integrations.findIndex(i => i.id === integration.id) + 1}`);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleEditSave = async (integrationId: string) => {
    // Here you would typically call an API to update the name
    // For now, we'll just close the edit mode
    console.log('Saving name:', editingName, 'for integration:', integrationId);
    setEditingId(null);
    setEditingName('');
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
          
          <div className="space-y-2">
            {integrations.map((integration, index) => (
              <Card key={integration.id} className="border-l-4 py-1" style={{ borderLeftColor: program.color }}>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg">{program.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {editingId === integration.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-6 text-xs font-medium"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditSave(integration.id);
                                  if (e.key === 'Escape') handleEditCancel();
                                }}
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSave(integration.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEditCancel}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <h4 className="font-medium text-xs">
                                {integration.name || `${program.name} Connection #${index + 1}`}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStart(integration)}
                                className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <Badge 
                            variant={integration.status === 'connected' ? 'default' : 'secondary'}
                            className={`text-xs ${integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {integration.status === 'connected' ? '✅ Connected' : '⚠️ ' + integration.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <Label className="text-gray-600 font-medium text-xs">Client ID</Label>
                            <p className="font-mono text-xs bg-gray-50 p-1 rounded break-all">
                              {integration.client_id || 'Not set'}
                            </p>
                          </div>
                          
                          <div>
                            {integration.access_token && (
                              <p className="text-xs bg-green-50 p-1 rounded text-green-700">
                                🔐 Token available - Connection active
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-3">
                      <div className="text-xs text-gray-500 text-right">
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
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Connection Button */}
          <div className="text-center space-y-2 p-2 bg-gray-50 rounded-lg border-t">
            <Button 
              onClick={() => onConnect(program.id)}
              disabled={loading}
              className="w-full max-w-xs text-white text-sm"
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
      ) : (
        <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
          <span className="text-4xl">{program.icon}</span>
          <h4 className="font-medium text-gray-900">
            Connect {program.name}
          </h4>
          <p className="text-gray-600 text-sm">
            Connect {program.name} for enhanced design integration
          </p>
          <Button 
            onClick={() => onConnect(program.id)}
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
};

export default CADProgramTab;
