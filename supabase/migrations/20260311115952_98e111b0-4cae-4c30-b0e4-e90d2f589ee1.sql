
-- Add referral tracking columns
ALTER TABLE public.referrals 
  ADD COLUMN IF NOT EXISTS email_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_converted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reward_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reward_granted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reward_type text;

-- Update status default to support new statuses
-- (clicked, signup_started, email_confirmed, premium_paid, reward_granted, rejected)

-- Add self-referral prevention: unique constraint on referred_id
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_key;
ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_id_key UNIQUE (referred_id);
