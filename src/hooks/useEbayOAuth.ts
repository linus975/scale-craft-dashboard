
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEbayTokens } from './useEbayTokens';

export const useEbayOAuth = () => {
  const [loadingMarketplaces, setLoadingMarketplaces] = useState<Record<string, boolean>>({});
  const { createOrUpdateToken, refetch: refetchTokens } = useEbayTokens();

  const initiateEbayAuth = async (refetch: () => void) => {
    setLoadingMarketplaces(prev => ({ ...prev, ebay: true }));
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
        return;
      }

      // Use n8n callback URL as redirect URI
      const redirectUri = 'https://n8n.melemeng.com/webhook/ebay-callback';
      
      // All the eBay scopes
      const scopes = [
        'https://api.ebay.com/oauth/api_scope',
        'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.marketing',
        'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.account',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
        'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.finances',
        'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',
        'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.reputation',
        'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
        'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
        'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.stores',
        'https://api.ebay.com/oauth/api_scope/sell.stores.readonly',
        'https://api.ebay.com/oauth/scope/sell.edelivery'
      ];
      
      // Generate unique state to force new authorization and track user
      const uniqueState = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Construct eBay OAuth URL with parameters to force login screen every time
      const ebayAuthUrl = `https://auth.ebay.com/oauth2/authorize?` +
        `client_id=FloatCra-n8n-PRD-5b004feb6-52b5e1c1&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `state=${encodeURIComponent(uniqueState)}&` +
        `prompt=login`;

      console.log('Opening eBay OAuth URL with forced login:', ebayAuthUrl);
      
      // Open popup and clear any existing session data to force fresh login
      const popup = window.open('', 'ebayAuth', 'width=600,height=700,scrollbars=yes,resizable=yes');

      if (popup) {
        // Clear all storage and cookies, then navigate to eBay auth
        popup.document.write(`
          <html>
            <head><title>Connecting to eBay...</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
              <h3>Connecting to eBay...</h3>
              <p>Please wait while we redirect you to eBay login...</p>
              <script>
                // Clear all possible storage
                if (window.localStorage) window.localStorage.clear();
                if (window.sessionStorage) window.sessionStorage.clear();
                
                // Clear cookies
                document.cookie.split(";").forEach(function(c) { 
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                // Navigate to eBay auth after clearing
                setTimeout(() => {
                  window.location.href = '${ebayAuthUrl}';
                }, 500);
              </script>
            </body>
          </html>
        `);
      }

      // Listen for messages from n8n or manual integration creation
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'EBAY_OAUTH_SUCCESS') {
          console.log('eBay OAuth successful:', event.data);
          
          // Save token data if provided
          if (event.data.tokenData) {
            createOrUpdateToken(event.data.tokenData).then(() => {
              console.log('Token saved, refreshing tokens and integrations...');
              refetchTokens();
              // Refresh marketplace integrations
              setTimeout(() => {
                refetch();
              }, 2000); // Longer delay to ensure marketplace integration is created
            }).catch(error => {
              console.error('Error saving eBay token:', error);
            });
          } else {
            console.log('No token data received, but refreshing integrations anyway...');
            refetch();
          }
          
          setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
          
          if (popup && !popup.closed) {
            popup.close();
          }
          
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'EBAY_OAUTH_ERROR') {
          console.error('eBay OAuth error:', event.data.error);
          setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
          
          if (popup && !popup.closed) {
            popup.close();
          }
          
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Also check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
          setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
        }
      }, 1000);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 300000);
      
    } catch (error) {
      console.error('Error initiating eBay OAuth:', error);
      setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
    }
  };

  return {
    loadingMarketplaces,
    initiateEbayAuth
  };
};
