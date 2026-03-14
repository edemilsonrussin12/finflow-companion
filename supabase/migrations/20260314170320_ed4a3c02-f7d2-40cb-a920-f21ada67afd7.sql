-- =============================================
-- SECURITY HARDENING: Fix all RLS policies
-- Change from 'public' role to 'authenticated'
-- =============================================

-- === BUDGETS ===
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can select own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;

CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own budgets" ON public.budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- === FINANCIAL_GOALS ===
DROP POLICY IF EXISTS "Users can delete own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can select own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.financial_goals;

CREATE POLICY "Users can delete own goals" ON public.financial_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.financial_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own goals" ON public.financial_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.financial_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- === GOAL_CONTRIBUTIONS ===
DROP POLICY IF EXISTS "Users can delete own contributions" ON public.goal_contributions;
DROP POLICY IF EXISTS "Users can insert own contributions" ON public.goal_contributions;
DROP POLICY IF EXISTS "Users can select own contributions" ON public.goal_contributions;

CREATE POLICY "Users can delete own contributions" ON public.goal_contributions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contributions" ON public.goal_contributions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own contributions" ON public.goal_contributions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === SALES ===
DROP POLICY IF EXISTS "Users can delete own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can select own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can update own sales" ON public.sales;

CREATE POLICY "Users can delete own sales" ON public.sales FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own sales" ON public.sales FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sales" ON public.sales FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- === TRANSACTIONS ===
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can select own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;

CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- === PROFILES ===
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- === REFERRAL_CODES ===
DROP POLICY IF EXISTS "Users can insert own referral code" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can view own referral code" ON public.referral_codes;

CREATE POLICY "Users can insert own referral code" ON public.referral_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own referral code" ON public.referral_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === REFERRALS ===
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

-- === USER_SUBSCRIPTIONS ===
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);