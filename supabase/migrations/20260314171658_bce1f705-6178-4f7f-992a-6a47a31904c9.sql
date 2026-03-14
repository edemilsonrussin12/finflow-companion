-- 1. Restrict referrals INSERT to enforce safe default values
DROP POLICY IF EXISTS "Authenticated users can insert referral" ON public.referrals;
CREATE POLICY "Authenticated users can insert referral" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = referred_id
    AND referrer_id != auth.uid()
    AND public.referrer_code_exists(referrer_id)
    AND status = 'pending'
    AND premium_converted = false
    AND reward_granted = false
    AND reward_granted_at IS NULL
    AND email_confirmed = false
  );

-- 2. Restrict user_subscriptions INSERT to block trial manipulation
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_premium = false
    AND plan_type IS NULL
    AND premium_expires_at IS NULL
    AND premium_started_at IS NULL
    AND mercadopago_payment_id IS NULL
    AND trial_start_at IS NULL
    AND trial_end_at IS NULL
    AND trial_used = false
  );