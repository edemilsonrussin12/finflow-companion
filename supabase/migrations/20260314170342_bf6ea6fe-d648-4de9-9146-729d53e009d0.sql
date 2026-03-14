-- Fix leads INSERT policy to not use bare true
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(email) > 0 AND char_length(name) > 0
);