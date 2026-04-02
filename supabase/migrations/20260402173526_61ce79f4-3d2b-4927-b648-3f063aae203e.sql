
-- Allow users to delete their own business profile
CREATE POLICY "Users can delete own business profile"
  ON public.business_profile FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tighten payments INSERT policy to restrict plan_type
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND mercadopago_payment_id IS NULL
    AND plan_type IN ('monthly', 'annual')
  );
