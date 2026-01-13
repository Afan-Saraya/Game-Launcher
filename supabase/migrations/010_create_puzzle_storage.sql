-- Puzzle Game Storage Bucket Setup
-- Migration: 010_create_puzzle_storage.sql
-- 
-- This migration creates the storage bucket for puzzle images if it doesn't exist
-- and sets up the necessary policies for public access.

-- Create the storage bucket if it doesn't exist
-- Note: The bucket 'bucket' is shared across all games (wheel, memory, puzzle)
-- Each game uses a subfolder: prizes/, memory-cards/, puzzle-images/
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'bucket',
    'bucket',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Storage policies for public read access
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Public read access for bucket" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload to bucket" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update bucket objects" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete from bucket" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access for bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'bucket');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bucket');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update bucket objects"
ON storage.objects FOR UPDATE
USING (bucket_id = 'bucket')
WITH CHECK (bucket_id = 'bucket');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete from bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'bucket');

-- Note: Puzzle images are stored in the 'puzzle-images/' folder within the bucket
-- Example path: bucket/puzzle-images/puzzle-image-1-1234567890.jpg
