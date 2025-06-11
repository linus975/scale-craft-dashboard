
-- Make program_type column nullable in cad_integrations table
ALTER TABLE public.cad_integrations ALTER COLUMN program_type DROP NOT NULL;
