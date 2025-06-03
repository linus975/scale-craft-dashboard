
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const createOrUpdateMarketplaceIntegration = async (
  userId: string, 
  ebayAccountId: string | null,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    console.log('Creating/updating marketplace integration for eBay account:', ebayAccountId);
    
    const integrationData = {
      name: `eBay${ebayAccountId ? ` (${ebayAccountId})` : ''}`,
      marketplace_type: 'ebay',
      icon: '🛒',
      status: 'connected',
      user_id: userId,
      sync_frequency: 'hourly',
      orders_synced: 0
    };

    // Check if integration already exists for this user and marketplace type
    const { data: existingIntegration, error: selectError } = await supabase
      .from('marketplace_integrations')
      .select('id, name')
      .eq('user_id', userId)
      .eq('marketplace_type', 'ebay')
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing integration:', selectError);
      throw selectError;
    }

    if (existingIntegration) {
      console.log('Updating existing eBay integration:', existingIntegration.id);
      // Update existing integration
      const { error: updateError } = await supabase
        .from('marketplace_integrations')
        .update({
          ...integrationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIntegration.id);

      if (updateError) throw updateError;
      console.log('eBay marketplace integration updated successfully');
    } else {
      console.log('Creating new eBay integration for user:', userId);
      // Create new integration
      const { error: insertError } = await supabase
        .from('marketplace_integrations')
        .insert(integrationData);

      if (insertError) throw insertError;
      console.log('eBay marketplace integration created successfully');
    }

    toast({
      title: "eBay connected",
      description: "eBay marketplace integration has been set up successfully.",
    });

  } catch (error) {
    console.error('Error creating/updating marketplace integration:', error);
    toast({
      title: "Warning",
      description: "eBay token saved but marketplace integration failed. Please refresh the page.",
      variant: "destructive",
    });
    // Don't throw error here to not break the token saving process
  }
};
