
-- Create a trigger function to set quote_number per user
CREATE OR REPLACE FUNCTION public.set_user_quote_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _max_number integer;
BEGIN
  SELECT COALESCE(MAX(quote_number), 0) INTO _max_number
  FROM budgets
  WHERE user_id = NEW.user_id;

  NEW.quote_number := _max_number + 1;
  RETURN NEW;
END;
$$;

-- Create the trigger (runs before insert)
CREATE TRIGGER set_budget_quote_number
BEFORE INSERT ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.set_user_quote_number();
