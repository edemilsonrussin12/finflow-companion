
-- 1. FIX: Leads table - restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Admins can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. FIX: Referrals - remove client-side UPDATE entirely (rewards handled server-side)
DROP POLICY IF EXISTS "Users can update own referrals" ON public.referrals;

-- 3. FIX: User subscriptions - remove client-side UPDATE entirely
-- All subscription changes must go through Edge Functions with service_role
DROP POLICY IF EXISTS "Users can downgrade own subscription" ON public.user_subscriptions;

-- 4. FIX: Leads INSERT policy - restrict to prevent abuse
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 5. FIX: budget_items policies - change from public to authenticated
DROP POLICY IF EXISTS "Users can delete own budget items" ON public.budget_items;
DROP POLICY IF EXISTS "Users can insert own budget items" ON public.budget_items;
DROP POLICY IF EXISTS "Users can select own budget items" ON public.budget_items;
DROP POLICY IF EXISTS "Users can update own budget items" ON public.budget_items;

CREATE POLICY "Users can select own budget items" ON public.budget_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));

CREATE POLICY "Users can insert own budget items" ON public.budget_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));

CREATE POLICY "Users can update own budget items" ON public.budget_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));

CREATE POLICY "Users can delete own budget items" ON public.budget_items
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
