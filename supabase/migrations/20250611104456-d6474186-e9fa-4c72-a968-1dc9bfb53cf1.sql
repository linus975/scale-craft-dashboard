
-- Add token_expires_in column to cad_integrations table
ALTER TABLE public.cad_integrations 
ADD COLUMN token_expires_in INTEGER;
