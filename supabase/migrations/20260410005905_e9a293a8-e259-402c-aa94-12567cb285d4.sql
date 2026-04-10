
-- Remove insecure INSERT and UPDATE policies
DROP POLICY IF EXISTS "Users can insert own usage limits" ON public.user_usage_limits;
DROP POLICY IF EXISTS "Users can update own usage limits" ON public.user_usage_limits;

-- Create SECURITY DEFINER function to increment usage counters safely
CREATE OR REPLACE FUNCTION public.increment_usage_counter(_field text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _mes date := date_trunc('month', now())::date;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate field name to prevent SQL injection
  IF _field NOT IN ('orcamentos_criados_mes', 'metas_criadas_mes', 'pdfs_gerados_mes') THEN
    RAISE EXCEPTION 'Invalid field name';
  END IF;

  -- Upsert: create record if not exists, then increment
  INSERT INTO user_usage_limits (user_id, mes_referencia)
  VALUES (_user_id, _mes)
  ON CONFLICT (user_id, mes_referencia) DO NOTHING;

  -- Increment the specific counter
  IF _field = 'orcamentos_criados_mes' THEN
    UPDATE user_usage_limits SET orcamentos_criados_mes = orcamentos_criados_mes + 1
    WHERE user_id = _user_id AND mes_referencia = _mes;
  ELSIF _field = 'metas_criadas_mes' THEN
    UPDATE user_usage_limits SET metas_criadas_mes = metas_criadas_mes + 1
    WHERE user_id = _user_id AND mes_referencia = _mes;
  ELSIF _field = 'pdfs_gerados_mes' THEN
    UPDATE user_usage_limits SET pdfs_gerados_mes = pdfs_gerados_mes + 1
    WHERE user_id = _user_id AND mes_referencia = _mes;
  END IF;
END;
$$;
