-- Create a SECURITY DEFINER function for auto-expiring subscriptions
-- This replaces the client-side update in usePremiumStatus.ts
CREATE OR REPLACE FUNCTION public.expire_subscription_if_needed(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_subscriptions
  SET is_premium = false, updated_at = now()
  WHERE user_id = _user_id
    AND is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < now()
    AND (plan_type IS NULL OR plan_type != 'trial');

  -- Also expire trials
  UPDATE user_subscriptions
  SET is_premium = false, updated_at = now()
  WHERE user_id = _user_id
    AND is_premium = true
    AND plan_type = 'trial'
    AND trial_end_at IS NOT NULL
    AND trial_end_at < now();
END;
$$;