
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

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

interface CADIntegrationCardProps {
  integration: CADIntegration;
  index: number;
  programIcon: string;
  programName: string;
  programColor: string;
  onDelete: (integrationId: string) => void;
  isDeleting: boolean;
}

const CADIntegrationCard: React.FC<CADIntegrationCardProps> = ({
  integration,
  index,
  programIcon,
  programName,
  programColor,
  onDelete,
  isDeleting
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
    <Card className="border-l-4" style={{ borderLeftColor: programColor }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{programIcon}</span>
            <div>
              <h4 className="font-medium">
                {integration.name || `${programName} Connection #${index + 1}`}
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
              onClick={() => onDelete(integration.id)}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? (
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
  );
};

export default CADIntegrationCard;
