
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CredentialsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMarketplace: { name: string } | null;
  credentials: {
    clientId: string;
    apiKey: string;
    webhookUrl: string;
  };
  onCredentialsChange: (credentials: { clientId: string; apiKey: string; webhookUrl: string }) => void;
  onSubmit: () => void;
  isEdit?: boolean;
}

const CredentialsDialog: React.FC<CredentialsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedMarketplace,
  credentials,
  onCredentialsChange,
  onSubmit,
  isEdit = false
}) => {
  const handleInputChange = (field: keyof typeof credentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      [field]: e.target.value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Integration' : 'API Credentials'} - {selectedMarketplace?.name}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Bearbeiten Sie die API-Zugangsdaten für diese Integration'
              : 'Geben Sie Ihre API-Zugangsdaten ein um die Integration zu vervollständigen'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              placeholder="Ihre Client ID"
              value={credentials.clientId}
              onChange={handleInputChange('clientId')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key / Password</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Ihr API Key"
              value={credentials.apiKey}
              onChange={handleInputChange('apiKey')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-webhook-url.com"
              value={credentials.webhookUrl}
              onChange={handleInputChange('webhookUrl')}
            />
          </div>
          <Button 
            onClick={onSubmit} 
            className="w-full"
            disabled={!credentials.clientId || !credentials.apiKey}
          >
            {isEdit ? 'Integration aktualisieren' : 'Integration hinzufügen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialsDialog;
