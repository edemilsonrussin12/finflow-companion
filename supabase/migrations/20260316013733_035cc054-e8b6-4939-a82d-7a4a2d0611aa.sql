
-- Fix expire function: remove plan_type restriction, expire ANY sub where premium_expires_at passed
CREATE OR REPLACE FUNCTION public.expire_subscription_if_needed(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Expire any premium subscription where premium_expires_at has passed
  UPDATE user_subscriptions
  SET is_premium = false, updated_at = now()
  WHERE user_id = _user_id
    AND is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < now();

  -- Also expire trials based on trial_end_at (fallback if premium_expires_at wasn't set)
  UPDATE user_subscriptions
  SET is_premium = false, updated_at = now()
  WHERE user_id = _user_id
    AND is_premium = true
    AND plan_type = 'trial'
    AND trial_end_at IS NOT NULL
    AND trial_end_at < now()
    AND (premium_expires_at IS NULL);
END;
$$;

-- Fix trial trigger function to also set premium_expires_at for consistency
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, is_premium, trial_start_at, trial_end_at, trial_used, plan_type, premium_expires_at)
  VALUES (NEW.id, true, now(), now() + interval '3 days', true, 'trial', now() + interval '3 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix existing trial subs that have trial_end_at but no premium_expires_at
UPDATE public.user_subscriptions
SET premium_expires_at = trial_end_at
WHERE plan_type = 'trial'
  AND trial_end_at IS NOT NULL
  AND premium_expires_at IS NULL;
