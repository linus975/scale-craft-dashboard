
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EbayToken {
  id: string;
  user_id: string;
  ebay_account_id: string;
  access_token: string;
  access_token_expires: string;
  refresh_token: string;
  refresh_token_expires: string;
  scope: string;
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

  const createOrUpdateToken = async (tokenData: Omit<EbayToken, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ebay_oauth_tokens')
        .upsert({
          user_id: user.id,
          ebay_account_id: tokenData.ebay_account_id,
          access_token: tokenData.access_token,
          access_token_expires: tokenData.access_token_expires,
          refresh_token: tokenData.refresh_token,
          refresh_token_expires: tokenData.refresh_token_expires,
          scope: tokenData.scope
        }, {
          onConflict: 'user_id,ebay_account_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTokens(prev => {
        const existingIndex = prev.findIndex(t => t.ebay_account_id === data.ebay_account_id);
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
        description: `Token for eBay account ${data.ebay_account_id} has been saved successfully.`,
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
        description: `Token for eBay account ${token?.ebay_account_id} has been removed.`,
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

  const getValidToken = (ebayAccountId: string) => {
    const token = tokens.find(t => t.ebay_account_id === ebayAccountId);
    if (!token) return null;

    const now = new Date();
    const expiresAt = new Date(token.access_token_expires);
    
    // Return token if it's still valid (with 5 minute buffer)
    if (expiresAt.getTime() > now.getTime() + 5 * 60 * 1000) {
      return token;
    }
    
    return null;
  };

  const isTokenExpiringSoon = (token: EbayToken, minutesBuffer = 30) => {
    const now = new Date();
    const expiresAt = new Date(token.access_token_expires);
    return expiresAt.getTime() <= now.getTime() + minutesBuffer * 60 * 1000;
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
