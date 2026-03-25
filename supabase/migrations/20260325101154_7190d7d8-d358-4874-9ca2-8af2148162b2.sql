
-- Server-side function to enforce free-tier transaction limit (50/month)
CREATE OR REPLACE FUNCTION public.check_transaction_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _is_premium boolean;
  _month_count integer;
  _free_limit constant integer := 50;
BEGIN
  -- Check if user is premium
  SELECT COALESCE(us.is_premium, false) INTO _is_premium
  FROM user_subscriptions us
  WHERE us.user_id = NEW.user_id;

  -- If premium (or admin), allow
  IF _is_premium THEN
    RETURN NEW;
  END IF;

  -- Check admin role
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.user_id AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  -- Count current month transactions
  SELECT COUNT(*) INTO _month_count
  FROM transactions
  WHERE user_id = NEW.user_id
    AND date_trunc('month', date::timestamp) = date_trunc('month', CURRENT_DATE::timestamp);

  IF _month_count >= _free_limit THEN
    RAISE EXCEPTION 'Limite mensal de % transações atingido. Faça upgrade para Premium.', _free_limit;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to transactions table
DROP TRIGGER IF EXISTS enforce_transaction_limit ON transactions;
CREATE TRIGGER enforce_transaction_limit
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION check_transaction_limit();
