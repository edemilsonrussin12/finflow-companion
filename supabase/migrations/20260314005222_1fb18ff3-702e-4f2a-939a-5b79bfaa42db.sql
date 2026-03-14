
-- =============================================
-- FINCONTROL 2.0 SECURITY + CLIENTS TABLE
-- =============================================

-- 1. Create clients table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Restrict user_subscriptions UPDATE - only allow setting is_premium to false (downgrade)
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;

-- Create restricted policy: users can only downgrade themselves
CREATE POLICY "Users can downgrade own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_premium = false);

-- 3. Add new budget fields
ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS validity_days integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT '';

-- 4. Add client_id to budgets for linking
ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
