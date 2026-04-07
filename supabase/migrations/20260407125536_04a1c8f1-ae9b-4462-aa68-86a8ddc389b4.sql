
-- Fix 1: Referrals INSERT policy - require actual referral code validation
DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = referred_id
    AND referrer_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.user_id = referrer_id
    )
  );

-- Fix 2: Allow referred users to view their own referral record
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
