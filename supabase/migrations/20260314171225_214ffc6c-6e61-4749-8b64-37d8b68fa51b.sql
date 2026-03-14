-- Fix goal_contributions INSERT to verify goal ownership
DROP POLICY IF EXISTS "Users can insert own contributions" ON public.goal_contributions;
CREATE POLICY "Users can insert own contributions" ON public.goal_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM financial_goals WHERE financial_goals.id = goal_contributions.goal_id AND financial_goals.user_id = auth.uid())
  );

-- Fix referrals: create a helper function to validate referrer code exists
CREATE OR REPLACE FUNCTION public.referrer_code_exists(_referrer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM referral_codes WHERE user_id = _referrer_id)
$$;

-- Recreate referrals INSERT policy using the helper
DROP POLICY IF EXISTS "Authenticated users can insert referral" ON public.referrals;
CREATE POLICY "Authenticated users can insert referral" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = referred_id
    AND referrer_id != auth.uid()
    AND public.referrer_code_exists(referrer_id)
  );