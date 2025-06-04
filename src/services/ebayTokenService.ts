
import { supabase } from '@/integrations/supabase/client';
import type { EbayToken, EbayTokenInsert } from '@/types/ebayTypes';

export const fetchEbayTokens = async (): Promise<EbayToken[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('ebay_oauth_tokens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const saveEbayToken = async (tokenData: EbayTokenInsert): Promise<EbayToken> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const insertData: any = {
    access_token: tokenData.access_token,
    ebay_username: tokenData.ebay_username, // Now required field
  };

  // Only include fields that are provided
  if (user?.id) insertData.user_id = user.id;
  if (tokenData.access_token_expires) insertData.access_token_expires = tokenData.access_token_expires;
  if (tokenData.refresh_token) insertData.refresh_token = tokenData.refresh_token;
  if (tokenData.refresh_token_expires) insertData.refresh_token_expires = tokenData.refresh_token_expires;
  if (tokenData.scope) insertData.scope = tokenData.scope;
  if (tokenData.expires_in) insertData.expires_in = tokenData.expires_in;
  if (tokenData.refresh_token_expires_in) insertData.refresh_token_expires_in = tokenData.refresh_token_expires_in;

  const { data, error } = await supabase
    .from('ebay_oauth_tokens')
    .upsert(insertData, {
      onConflict: 'user_id,ebay_username'
    })
    .select()
    .single();

  if (error) throw error;

  // Automatically create/update marketplace integration entry
  if (user?.id) {
    console.log('Creating marketplace integration for eBay token...');
    await createMarketplaceIntegration(user.id, data.ebay_username);
  }

  return data;
};

const createMarketplaceIntegration = async (userId: string, ebayUsername: string) => {
  try {
    const integrationData = {
      name: `eBay (${ebayUsername})`,
      marketplace_type: 'ebay',
      icon: '🛒',
      status: 'connected',
      user_id: userId,
      sync_frequency: 'hourly',
      orders_synced: 0
    };

    // Check if integration already exists for this user and eBay username
    const { data: existingIntegration } = await supabase
      .from('marketplace_integrations')
      .select('id')
      .eq('user_id', userId)
      .eq('marketplace_type', 'ebay')
      .eq('name', `eBay (${ebayUsername})`)
      .maybeSingle();

    if (existingIntegration) {
      // Update existing integration
      const { error: updateError } = await supabase
        .from('marketplace_integrations')
        .update({
          ...integrationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIntegration.id);

      if (updateError) {
        console.error('Error updating marketplace integration:', updateError);
      } else {
        console.log('eBay marketplace integration updated successfully');
      }
    } else {
      // Create new integration
      const { error: insertError } = await supabase
        .from('marketplace_integrations')
        .insert(integrationData);

      if (insertError) {
        console.error('Error creating marketplace integration:', insertError);
      } else {
        console.log('eBay marketplace integration created successfully');
      }
    }
  } catch (error) {
    console.error('Error in createMarketplaceIntegration:', error);
  }
};

export const deleteEbayToken = async (tokenId: string): Promise<void> => {
  const { error } = await supabase
    .from('ebay_oauth_tokens')
    .delete()
    .eq('id', tokenId);

  if (error) throw error;
};
