-- Drop the permissive public read policy on business-assets bucket
DROP POLICY IF EXISTS "Anyone can view business assets" ON storage.objects;