
DROP POLICY "Anyone can insert referral" ON public.referrals;
CREATE POLICY "Authenticated users can insert referral" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_id);
