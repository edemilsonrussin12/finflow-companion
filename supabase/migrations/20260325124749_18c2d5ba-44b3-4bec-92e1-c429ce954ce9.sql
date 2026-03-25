-- Block all client-side mutations on user_roles
-- Roles must only be assigned via service role key (edge functions / superuser)

CREATE POLICY "Deny user_roles insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny user_roles update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Deny user_roles delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (false);