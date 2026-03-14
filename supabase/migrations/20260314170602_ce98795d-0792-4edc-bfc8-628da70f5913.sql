-- =============================================
-- SECURITY HARDENING: Fix privilege escalation vulnerabilities
-- =============================================

-- 1. RESTRICT user_subscriptions INSERT to safe defaults only
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
  );

-- 2. RESTRICT payments INSERT to pending status only
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND mercadopago_payment_id IS NULL
  );

-- 3. RESTRICT referrals INSERT to prevent self-referrals and validate referrer
DROP POLICY IF EXISTS "Authenticated users can insert referral" ON public.referrals;
CREATE POLICY "Authenticated users can insert referral" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = referred_id
    AND referrer_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.referral_codes
      WHERE referral_codes.user_id = referrals.referrer_id
    )
  );