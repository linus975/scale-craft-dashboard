
-- Make name column nullable in cad_integrations table
ALTER TABLE public.cad_integrations ALTER COLUMN name DROP NOT NULL;
