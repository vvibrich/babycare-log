-- Add photo_url column to records table
ALTER TABLE records ADD COLUMN photo_url TEXT;

-- Create storage bucket for record photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('record-photos', 'record-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage bucket
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'record-photos');

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'record-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'record-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'record-photos' 
  AND auth.role() = 'authenticated'
);
