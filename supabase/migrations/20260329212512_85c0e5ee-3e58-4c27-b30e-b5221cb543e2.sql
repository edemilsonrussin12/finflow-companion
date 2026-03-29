-- 1. Deny UPDATE on user_subscriptions
CREATE POLICY "Deny user_subscriptions update"
  ON public.user_subscriptions FOR UPDATE TO authenticated USING (false);

-- 2. Deny DELETE on user_subscriptions
CREATE POLICY "Deny user_subscriptions delete"
  ON public.user_subscriptions FOR DELETE TO authenticated USING (false);