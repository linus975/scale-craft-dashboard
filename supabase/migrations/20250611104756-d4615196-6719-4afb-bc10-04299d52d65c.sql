
-- Add token columns to cad_integrations table
ALTER TABLE public.cad_integrations 
ADD COLUMN token_type TEXT,
ADD COLUMN refresh_token TEXT,
ADD COLUMN access_token TEXT;
