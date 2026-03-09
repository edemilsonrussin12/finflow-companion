
-- Fix overly permissive INSERT policy on payments
DROP POLICY IF EXISTS "Service can insert payments" ON public.payments;

-- Edge functions use service_role which bypasses RLS, so we just need user self-insert
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
