
-- Add OAuth token fields to marketplace_integrations table
ALTER TABLE marketplace_integrations 
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;
