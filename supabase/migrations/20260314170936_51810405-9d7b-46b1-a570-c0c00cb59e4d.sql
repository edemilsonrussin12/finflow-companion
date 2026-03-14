-- Create a SECURITY DEFINER function for user self-cancellation
-- Only allows setting is_premium to false (never true)
CREATE OR REPLACE FUNCTION public.cancel_own_subscription(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is cancelling their own subscription
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE user_subscriptions
  SET is_premium = false, updated_at = now()
  WHERE user_id = _user_id;
END;
$$;