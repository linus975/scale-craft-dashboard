
import { useToast } from '@/hooks/use-toast';

export class SyncFrequencyService {
  private toast: ReturnType<typeof useToast>['toast'];

  constructor(toast: ReturnType<typeof useToast>['toast']) {
    this.toast = toast;
  }

  async configureSyncFrequency(
    integrationId: string, 
    frequency: string, 
    integration: any,
    setIsSyncing: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ) {
    if (!frequency) {
      this.toast({
        title: "Error",
        description: "Please select a sync frequency.",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = integration.webhook_url;
    
    if (!webhookUrl) {
      this.toast({
        title: "Error",
        description: "No webhook URL configured for this integration. Please edit the integration and add a webhook URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(prev => ({ ...prev, [integrationId]: true }));

    try {
      console.log('Starting frequency sync webhook call...');
      console.log('Integration:', integration.name);
      console.log('Webhook URL:', webhookUrl);
      console.log('Frequency:', frequency);
      
      const requestBody = {
        interval: frequency,
        marketplace_id: integrationId,
        timestamp: new Date().toISOString(),
        action: 'schedule'
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Frequency sync webhook request sent successfully');

      const syncFrequencyOptions = [
        { value: 'every30min', label: 'Every 30 minutes' },
        { value: 'hourly', label: 'Every hour' },
        { value: 'every3hours', label: 'Every 3 hours' }
      ];

      this.toast({
        title: "Sync frequency configured",
        description: `Automatic sync has been set to "${syncFrequencyOptions.find(opt => opt.value === frequency)?.label}".`,
      });
    } catch (error: any) {
      console.error('Error setting sync frequency:', error);
      this.toast({
        title: "Configuration Error",
        description: `The sync frequency could not be set: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  }
}
