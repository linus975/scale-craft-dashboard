
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
  };

  // Only include fields that are provided
  if (user?.id) insertData.user_id = user.id;
  if (tokenData.ebay_account_id) insertData.ebay_account_id = tokenData.ebay_account_id;
  if (tokenData.access_token_expires) insertData.access_token_expires = tokenData.access_token_expires;
  if (tokenData.refresh_token) insertData.refresh_token = tokenData.refresh_token;
  if (tokenData.refresh_token_expires) insertData.refresh_token_expires = tokenData.refresh_token_expires;
  if (tokenData.scope) insertData.scope = tokenData.scope;
  if (tokenData.expires_in) insertData.expires_in = tokenData.expires_in;
  if (tokenData.refresh_token_expires_in) insertData.refresh_token_expires_in = tokenData.refresh_token_expires_in;

  const { data, error } = await supabase
    .from('ebay_oauth_tokens')
    .upsert(insertData, {
      onConflict: 'user_id,ebay_account_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEbayToken = async (tokenId: string): Promise<void> => {
  const { error } = await supabase
    .from('ebay_oauth_tokens')
    .delete()
    .eq('id', tokenId);

  if (error) throw error;
};
