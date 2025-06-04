
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export class EbaySyncService {
  private toast: ReturnType<typeof useToast>['toast'];

  constructor(toast: ReturnType<typeof useToast>['toast']) {
    this.toast = toast;
  }

  async syncEbayIntegration(integration: any, integrationId: string, updateIntegration: any) {
    try {
      console.log('Starting webhook call...');
      console.log('Integration:', integration.name);
      console.log('Is eBay integration:', integration.ebay_username || integration.marketplace_type === 'ebay');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not logged in');
      }

      const webhookUrl = 'https://n8n.melemeng.com/webhook/Ebay_Sync';
      const shopName = integration.ebay_username || integration.name;
      
      const requestBody = {
        user_id: user.id,
        shop_name: shopName,
        platform: 'ebay'
      };
      
      console.log('eBay webhook URL:', webhookUrl);
      console.log('eBay request body:', JSON.stringify(requestBody, null, 2));

      // Update last sync time in database first (only for non-eBay virtual integrations)
      if (!integrationId.startsWith('ebay-token-')) {
        await updateIntegration(integrationId, {
          last_sync: new Date().toISOString(),
          status: 'connected'
        });
      }

      // Make POST request to the webhook URL
      console.log('Making POST request to webhook...');
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

      console.log('Webhook POST request sent successfully');

      this.toast({
        title: "Sync started",
        description: `${integration.name} webhook was successfully called.`,
      });
    } catch (error: any) {
      console.error('eBay sync error details:', error);
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
