-- Create storage bucket for device images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('device-images', 'device-images', true);

-- Allow authenticated users to upload device images
CREATE POLICY "Allow authenticated users to upload device images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'device-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their own device images
CREATE POLICY "Allow users to read their own device images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'device-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to device images (for OCR processing)
CREATE POLICY "Allow public read access to device images" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'device-images');

-- Allow authenticated users to delete their own device images
CREATE POLICY "Allow users to delete their own device images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'device-images' AND auth.uid()::text = (storage.foldername(name))[1]);
