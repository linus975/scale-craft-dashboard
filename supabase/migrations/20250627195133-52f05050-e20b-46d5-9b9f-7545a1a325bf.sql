
-- Erstelle den design-files bucket falls er nicht existiert
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'design-files',
  'design-files', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/octet-stream', 'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'model/stl', 'application/x-fusion360', 'text/x-ini']
)
ON CONFLICT (id) DO NOTHING;

-- Erstelle RLS Policies für den design-files bucket
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
