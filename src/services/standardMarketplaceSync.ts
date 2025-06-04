
import { useToast } from '@/hooks/use-toast';

export class StandardMarketplaceSyncService {
  private toast: ReturnType<typeof useToast>['toast'];

  constructor(toast: ReturnType<typeof useToast>['toast']) {
    this.toast = toast;
  }

  async syncStandardIntegration(integration: any, integrationId: string, updateIntegration: any) {
    try {
      const webhookUrl = integration.webhook_url;
      
      if (!webhookUrl) {
        this.toast({
          title: "Error",
          description: "No webhook URL configured for this integration. Please edit the integration and add a webhook URL.",
          variant: "destructive",
        });
        return;
      }

      const requestBody = {
        marketplace: integration.name,
        marketplace_id: integrationId,
        action: 'sync',
        timestamp: new Date().toISOString(),
        client_id: integration.client_id,
        api_key: integration.api_key,
        sync_fields: {
          ean_number: true,
          product_id: true,
          order_id: true,
          customer_email: true,
          amount: true,
          quantity: true,
          material: true,
          design_file: true
        }
      };
      
      console.log('Standard webhook URL:', webhookUrl);
      console.log('Standard request body:', JSON.stringify(requestBody, null, 2));

      // Update last sync time in database first
      await updateIntegration(integrationId, {
        last_sync: new Date().toISOString(),
        status: 'connected'
      });

      // Call the webhook URL with CORS enabled
      console.log('Making fetch request to webhook...');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Check response status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Webhook request sent successfully');

      this.toast({
        title: "Sync started",
        description: `${integration.name} webhook was successfully called.`,
      });
    } catch (error: any) {
      console.error('Standard sync error details:', error);
      console.error('Error message:', error.message);
      
      this.toast({
        title: "Sync Error",
        description: `Error during synchronization: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }
}
