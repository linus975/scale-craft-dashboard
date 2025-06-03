
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // This should contain the user_id
    const error = url.searchParams.get('error');

    console.log('eBay OAuth callback received:', { 
      code: !!code, 
      state, 
      error,
      allParams: Object.fromEntries(url.searchParams.entries())
    });

    if (error) {
      console.error('eBay OAuth error:', error);
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>eBay Integration Error</title></head>
          <body>
            <h2>eBay Integration Failed</h2>
            <p>Error: ${error}</p>
            <p>Please close this window and try again.</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'EBAY_OAUTH_ERROR', 
                    error: '${error}' 
                  }, '*');
                }
              } catch (e) {
                console.log('Could not communicate with parent window');
              }
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 400
      });
    }

    if (!code || !state) {
      console.error('Missing required parameters:', { code: !!code, state: !!state });
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>eBay Integration Error</title></head>
          <body>
            <h2>eBay Integration Failed</h2>
            <p>Missing required parameters (code or state)</p>
            <p>Please close this window and try again.</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'EBAY_OAUTH_ERROR', 
                    error: 'Missing required parameters' 
                  }, '*');
                }
              } catch (e) {
                console.log('Could not communicate with parent window');
              }
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 400
      });
    }

    // Get eBay credentials from environment
    const clientId = Deno.env.get('EBAY_CLIENT_ID');
    const clientSecret = Deno.env.get('EBAY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('eBay credentials not configured');
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>eBay Integration Error</title></head>
          <body>
            <h2>eBay Integration Failed</h2>
            <p>Server configuration error. Please contact support.</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'EBAY_OAUTH_ERROR', 
                    error: 'Server configuration error' 
                  }, '*');
                }
              } catch (e) {
                console.log('Could not communicate with parent window');
              }
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 500
      });
    }

    // Exchange authorization code for access token
    const tokenUrl = 'https://api.ebay.com/identity/v1/oauth2/token';
    // Use the eBay RuName as redirect_uri for token exchange
    const redirectUri = 'FloatCraft_UG-FloatCra-n8n-PR-lzkdds';

    console.log('Exchanging code for token with redirect_uri (RuName):', redirectUri);
    console.log('Using client_id:', clientId);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', tokenData);

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>eBay Integration Error</title></head>
          <body>
            <h2>eBay Integration Failed</h2>
            <p>Failed to exchange authorization code for access token.</p>
            <p>Error: ${tokenData.error_description || tokenData.error || 'Unknown error'}</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'EBAY_OAUTH_ERROR', 
                    error: '${tokenData.error_description || tokenData.error || 'Unknown error'}' 
                  }, '*');
                }
              } catch (e) {
                console.log('Could not communicate with parent window');
              }
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 400
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the integration in the database
    const { data: integration, error: dbError } = await supabase
      .from('marketplace_integrations')
      .insert({
        user_id: state, // user_id was passed as state parameter
        name: 'eBay',
        marketplace_type: 'ebay',
        client_id: clientId,
        api_key: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        webhook_url: 'https://n8n.melemeng.com/webhook/Ebay_Sync',
        sync_frequency: 'hourly',
        icon: '🛒',
        status: 'connected',
        last_sync: new Date().toISOString(),
        token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>eBay Integration Error</title></head>
          <body>
            <h2>eBay Integration Failed</h2>
            <p>Failed to save integration to database.</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'EBAY_OAUTH_ERROR', 
                    error: 'Database error' 
                  }, '*');
                }
              } catch (e) {
                console.log('Could not communicate with parent window');
              }
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 500
      });
    }

    console.log('eBay integration created successfully:', integration.id);

    // Return success page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>eBay Integration Successful</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            .success { color: green; }
            .info { color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2 class="success">🎉 eBay Integration Successful!</h2>
          <p>Your eBay account has been successfully connected.</p>
          <p class="info">You can now close this window and return to the application.</p>
          <script>
            // Try to communicate with parent window if this is a popup
            try {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'EBAY_OAUTH_SUCCESS', 
                  integration: ${JSON.stringify(integration)} 
                }, '*');
                setTimeout(() => window.close(), 1000);
              }
            } catch (e) {
              console.log('Could not communicate with parent window');
            }
            
            // Try to close the window after 3 seconds
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window automatically');
              }
            }, 3000);
          </script>
        </body>
      </html>
    `, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      status: 200
    });

  } catch (error) {
    console.error('Unexpected error in eBay OAuth callback:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>eBay Integration Error</title></head>
        <body>
          <h2>eBay Integration Failed</h2>
          <p>An unexpected error occurred. Please try again.</p>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'EBAY_OAUTH_ERROR', 
                  error: 'Unexpected error' 
                }, '*');
              }
            } catch (e) {
              console.log('Could not communicate with parent window');
            }
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
    `, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      status: 500
    });
  }
});
