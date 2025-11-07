-- Add photo_url column to records table
ALTER TABLE records ADD COLUMN photo_url TEXT;

-- Create storage bucket for record photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('record-photos', 'record-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage bucket
-- Allow anyone to view photos (bucket is public)
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'record-photos');

-- Allow anyone to upload photos (using anon key)
CREATE POLICY "Anyone can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'record-photos');

-- Allow anyone to update photos
CREATE POLICY "Anyone can update photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'record-photos');

-- Allow anyone to delete photos
CREATE POLICY "Anyone can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'record-photos');
