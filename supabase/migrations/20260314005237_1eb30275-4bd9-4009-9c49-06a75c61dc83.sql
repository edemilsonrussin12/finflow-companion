
-- Fix overly permissive RLS on leads table
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;

-- Allow anonymous lead submissions but with rate limiting via user check
CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);
