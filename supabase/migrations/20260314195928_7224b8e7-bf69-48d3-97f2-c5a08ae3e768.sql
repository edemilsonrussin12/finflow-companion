
DROP POLICY "Authenticated users can insert referral" ON public.referrals;

CREATE POLICY "Authenticated users can insert referral"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = referred_id)
    AND (referrer_id <> auth.uid())
    AND referrer_code_exists(referrer_id)
    AND (status = 'pending')
    AND (premium_converted = false)
    AND (reward_granted = false)
    AND (reward_granted_at IS NULL)
    AND (email_confirmed = false)
    AND NOT EXISTS (SELECT 1 FROM referrals WHERE referred_id = auth.uid())
  );
