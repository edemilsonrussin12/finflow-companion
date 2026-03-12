
-- Create business_profile table
CREATE TABLE public.business_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  signature_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own business profile" ON public.business_profile
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile" ON public.business_profile
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile" ON public.business_profile
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for business assets (logos and signatures)
INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', true);

-- Storage RLS policies
CREATE POLICY "Users can upload own business assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own business assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'business-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view business assets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'business-assets');

CREATE POLICY "Users can delete own business assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'business-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
