
-- Create usage limits table
CREATE TABLE public.user_usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  orcamentos_criados_mes integer NOT NULL DEFAULT 0,
  metas_criadas_mes integer NOT NULL DEFAULT 0,
  pdfs_gerados_mes integer NOT NULL DEFAULT 0,
  mes_referencia date NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_usage_limits_user_month_unique UNIQUE (user_id, mes_referencia)
);

-- Index for fast lookups
CREATE INDEX idx_user_usage_limits_user_month ON public.user_usage_limits (user_id, mes_referencia);

-- Enable RLS
ALTER TABLE public.user_usage_limits ENABLE ROW LEVEL SECURITY;

-- Users can view own usage
CREATE POLICY "Users can view own usage limits"
ON public.user_usage_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert own usage (new month record)
CREATE POLICY "Users can insert own usage limits"
ON public.user_usage_limits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own usage (increment counters)
CREATE POLICY "Users can update own usage limits"
ON public.user_usage_limits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Deny delete - counters must never decrease
CREATE POLICY "Deny usage limits delete"
ON public.user_usage_limits FOR DELETE
TO authenticated
USING (false);
