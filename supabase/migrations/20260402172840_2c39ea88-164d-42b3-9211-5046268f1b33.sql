
-- ai_usage: allow users to insert only their own records
CREATE POLICY "Users can insert own ai_usage"
  ON public.ai_usage FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ai_usage: deny UPDATE from client
CREATE POLICY "Deny ai_usage update"
  ON public.ai_usage FOR UPDATE TO authenticated
  USING (false);

-- ai_usage: deny DELETE from client
CREATE POLICY "Deny ai_usage delete"
  ON public.ai_usage FOR DELETE TO authenticated
  USING (false);

-- payments: constrain plan_type to valid values
ALTER TABLE public.payments
  ADD CONSTRAINT valid_plan_type CHECK (plan_type IN ('monthly', 'annual', 'lifetime'));
