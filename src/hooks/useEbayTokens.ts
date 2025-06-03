
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { EbayToken, EbayTokenInsert } from '@/types/ebayTypes';
import { getValidToken, isTokenExpiringSoon } from '@/utils/ebayTokenValidation';
import { fetchEbayTokens, saveEbayToken, deleteEbayToken } from '@/services/ebayTokenService';

export const useEbayTokens = () => {
  const [tokens, setTokens] = useState<EbayToken[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTokens = async () => {
    try {
      const data = await fetchEbayTokens();
      setTokens(data);
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

  const createOrUpdateToken = async (tokenData: EbayTokenInsert) => {
    try {
      const data = await saveEbayToken(tokenData);
      console.log('eBay token saved successfully:', data);

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

  const deleteToken = async (tokenId: string) => {
    try {
      const token = tokens.find(t => t.id === tokenId);
      
      await deleteEbayToken(tokenId);

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

  useEffect(() => {
    fetchTokens();
  }, []);

  return {
    tokens,
    loading,
    createOrUpdateToken,
    deleteToken,
    getValidToken: (ebayAccountId?: string | null) => getValidToken(tokens, ebayAccountId),
    isTokenExpiringSoon,
    refetch: fetchTokens
  };
};
