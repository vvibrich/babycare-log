-- Fix Storage Policies for record-photos bucket
-- Run this in Supabase SQL Editor to fix upload permissions

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- Create new policies that allow operations with anon key
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'record-photos');

CREATE POLICY "Anyone can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'record-photos');

CREATE POLICY "Anyone can update photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'record-photos');

CREATE POLICY "Anyone can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'record-photos');
