-- Create device-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'device-images',
  'device-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for device images
CREATE POLICY "Allow authenticated users to upload device images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'device-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to device images" ON storage.objects
FOR SELECT USING (bucket_id = 'device-images');

CREATE POLICY "Allow users to update their own device images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'device-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own device images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'device-images' AND 
  auth.role() = 'authenticated'
);
