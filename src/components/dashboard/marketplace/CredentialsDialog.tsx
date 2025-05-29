
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CredentialsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMarketplace: { name: string } | null;
  credentials: {
    clientId: string;
    apiKey: string;
    webhookUrl: string;
    syncFrequency?: string;
  };
  onCredentialsChange: (credentials: { clientId: string; apiKey: string; webhookUrl: string; syncFrequency?: string }) => void;
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
  const syncFrequencyOptions = [
    { value: 'every30min', label: 'Every 30 minutes' },
    { value: 'hourly', label: 'Every hour' },
    { value: 'every3hours', label: 'Every 3 hours' }
  ];

  const handleInputChange = (field: keyof typeof credentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      [field]: e.target.value
    });
  };

  const handleSyncFrequencyChange = (value: string) => {
    onCredentialsChange({
      ...credentials,
      syncFrequency: value
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
              ? 'Edit the API credentials for this integration'
              : 'Enter your API credentials to complete the integration'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              placeholder="Your Client ID"
              value={credentials.clientId}
              onChange={handleInputChange('clientId')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key / Password</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your API Key"
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
          <div className="space-y-2">
            <Label htmlFor="syncFrequency">Automatic Sync Frequency</Label>
            <Select
              value={credentials.syncFrequency || ''}
              onValueChange={handleSyncFrequencyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sync frequency..." />
              </SelectTrigger>
              <SelectContent>
                {syncFrequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={onSubmit} 
            className="w-full"
            disabled={!credentials.clientId || !credentials.apiKey}
          >
            {isEdit ? 'Update Integration' : 'Add Integration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialsDialog;
