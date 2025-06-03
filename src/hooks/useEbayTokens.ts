
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EbayToken {
  id: string;
  user_id?: string | null;
  ebay_account_id?: string | null;
  access_token: string;
  access_token_expires?: string | null;
  refresh_token?: string | null;
  refresh_token_expires?: string | null;
  scope?: string | null;
  expires_in?: number | null;
  refresh_token_expires_in?: number | null;
  created_at: string;
  updated_at: string;
}

export const useEbayTokens = () => {
  const [tokens, setTokens] = useState<EbayToken[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTokens = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTokens([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ebay_oauth_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error: any) {
      console.error('Error fetching eBay tokens:', error);
      toast({
        title: "Error loading eBay tokens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateToken = async (tokenData: Omit<EbayToken, 'id' | 'created_at' | 'updated_at'>) => {
    try {
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

      console.log('eBay token saved successfully:', data);

      // Create or update marketplace integration for eBay - this is crucial!
      if (user?.id) {
        console.log('Creating marketplace integration for user:', user.id);
        await createOrUpdateMarketplaceIntegration(user.id, data.ebay_account_id);
      }

      // Update local state
      setTokens(prev => {
        const existingIndex = prev.findIndex(t => 
          (t.ebay_account_id === data.ebay_account_id) || 
          (t.ebay_account_id === null && data.ebay_account_id === null)
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else {
          return [data, ...prev];
        }
      });

      toast({
        title: "eBay token saved",
        description: `Token for eBay account ${data.ebay_account_id || 'unknown'} has been saved successfully.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error saving eBay token:', error);
      toast({
        title: "Error saving eBay token",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const createOrUpdateMarketplaceIntegration = async (userId: string, ebayAccountId: string | null) => {
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

  const deleteToken = async (tokenId: string) => {
    try {
      const token = tokens.find(t => t.id === tokenId);
      
      const { error } = await supabase
        .from('ebay_oauth_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;

      setTokens(prev => prev.filter(t => t.id !== tokenId));
      toast({
        title: "eBay token deleted",
        description: `Token for eBay account ${token?.ebay_account_id || 'unknown'} has been removed.`,
      });
    } catch (error: any) {
      console.error('Error deleting eBay token:', error);
      toast({
        title: "Error deleting eBay token",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getValidToken = (ebayAccountId?: string | null) => {
    const token = tokens.find(t => 
      ebayAccountId ? t.ebay_account_id === ebayAccountId : t.ebay_account_id === null
    ) || tokens[0]; // Fallback to first token if no specific account ID match
    
    if (!token) return null;

    // Check if token is still valid
    if (token.expires_in && token.updated_at) {
      const tokenAge = Date.now() - new Date(token.updated_at).getTime();
      const tokenAgeInSeconds = Math.floor(tokenAge / 1000);
      
      // Return token if it's still valid (with 5 minute buffer)
      if (tokenAgeInSeconds < (token.expires_in - 300)) {
        return token;
      }
    }
    
    // Fallback to timestamp-based check if available
    if (token.access_token_expires) {
      const now = new Date();
      const expiresAt = new Date(token.access_token_expires);
      
      if (expiresAt.getTime() > now.getTime() + 5 * 60 * 1000) {
        return token;
      }
    }
    
    return null;
  };

  const isTokenExpiringSoon = (token: EbayToken, minutesBuffer = 30) => {
    // Check using expires_in if available
    if (token.expires_in && token.updated_at) {
      const tokenAge = Date.now() - new Date(token.updated_at).getTime();
      const tokenAgeInSeconds = Math.floor(tokenAge / 1000);
      return tokenAgeInSeconds >= (token.expires_in - minutesBuffer * 60);
    }
    
    // Fallback to timestamp-based check
    if (token.access_token_expires) {
      const now = new Date();
      const expiresAt = new Date(token.access_token_expires);
      return expiresAt.getTime() <= now.getTime() + minutesBuffer * 60 * 1000;
    }
    
    return false;
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return {
    tokens,
    loading,
    createOrUpdateToken,
    deleteToken,
    getValidToken,
    isTokenExpiringSoon,
    refetch: fetchTokens
  };
};
