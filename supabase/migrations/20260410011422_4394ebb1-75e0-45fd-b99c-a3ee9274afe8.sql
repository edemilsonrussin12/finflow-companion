CREATE POLICY "Deny direct update on usage limits"
ON public.user_usage_limits FOR UPDATE
TO authenticated
USING (false);