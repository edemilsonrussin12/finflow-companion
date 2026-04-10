
-- Add explicit DENY INSERT policy on user_usage_limits
CREATE POLICY "Deny direct insert on usage limits"
ON public.user_usage_limits FOR INSERT
TO authenticated
WITH CHECK (false);

-- Remove the looser duplicate INSERT policy on referrals
DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;
