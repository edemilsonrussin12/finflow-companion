ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS trial_start_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_end_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false;