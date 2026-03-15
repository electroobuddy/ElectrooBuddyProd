
-- Create a public storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Allow admins to upload/update/delete files
CREATE POLICY "Admins can upload images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update images" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

-- Anyone can view images (public bucket)
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'images');
