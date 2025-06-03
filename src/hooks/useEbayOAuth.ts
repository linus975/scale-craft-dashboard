
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

      // Use Supabase Edge Function as redirect URI
      const redirectUri = `https://xuxgxkemywnyranlhsjh.supabase.co/functions/v1/ebay-oauth-callback`;
      
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
      
      // Construct eBay OAuth URL with parameters to force login prompt
      const ebayAuthUrl = `https://auth.ebay.com/oauth2/authorize?` +
        `client_id=FloatCra-n8n-PRD-5b004feb6-52b5e1c1&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `state=${encodeURIComponent(uniqueState)}&` +
        `prompt=login&` +  // Force login prompt
        `approval_prompt=force&` +  // Force approval prompt
        `access_type=offline`;  // Request offline access

      console.log('Opening eBay OAuth URL with forced login:', ebayAuthUrl);
      console.log('Redirect URI (Supabase Edge Function):', redirectUri);
      console.log('Unique state for this authorization:', uniqueState);
      
      // Clear any existing eBay cookies/session in the popup to ensure fresh login
      const popup = window.open(
        'about:blank',  // Start with blank page
        'ebayAuth', 
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (popup) {
        // Clear storage and navigate to eBay auth
        popup.document.write(`
          <html>
            <head><title>Redirecting to eBay...</title></head>
            <body>
              <p>Redirecting to eBay login...</p>
              <script>
                // Clear any potential cached data
                if (window.localStorage) window.localStorage.clear();
                if (window.sessionStorage) window.sessionStorage.clear();
                
                // Navigate to eBay OAuth
                setTimeout(() => {
                  window.location.href = '${ebayAuthUrl}';
                }, 100);
              </script>
            </body>
          </html>
        `);
      }

      // Reset loading state function
      const resetLoadingState = () => {
        setLoadingMarketplaces(prev => ({ ...prev, ebay: false }));
      };

      // Listen for messages from the Edge Function
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'EBAY_OAUTH_SUCCESS') {
          console.log('eBay OAuth successful:', event.data);
          
          // Save token data if provided
          if (event.data.tokenData) {
            createOrUpdateToken(event.data.tokenData).then(() => {
              refetchTokens();
            }).catch(error => {
              console.error('Error saving eBay token:', error);
            });
          }
          
          resetLoadingState();
          
          // Refresh integrations to show the new one
          refetch();
          
          // Close the popup if still open
          if (popup && !popup.closed) {
            popup.close();
          }
          
          // Remove event listener
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'EBAY_OAUTH_ERROR') {
          console.error('eBay OAuth error:', event.data.error);
          resetLoadingState();
          
          // Close the popup if still open
          if (popup && !popup.closed) {
            popup.close();
          }
          
          // Remove event listener
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Check if popup was closed manually - this is the key fix!
      const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
          console.log('eBay OAuth popup was closed manually');
          resetLoadingState();
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
        }
      }, 1000);
      
      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        console.log('eBay OAuth timeout after 5 minutes');
        resetLoadingState();
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 300000); // 5 minutes

      // Clean up function for immediate errors
      const cleanup = () => {
        resetLoadingState();
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
        clearTimeout(timeout);
      };

      // If popup couldn't be opened
      if (!popup) {
        cleanup();
        return;
      }
      
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
