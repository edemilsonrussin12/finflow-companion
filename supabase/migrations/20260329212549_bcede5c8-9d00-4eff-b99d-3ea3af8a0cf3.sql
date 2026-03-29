-- Add email format validation constraint on leads
ALTER TABLE public.leads ADD CONSTRAINT leads_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$');

-- Add minimum name length constraint
ALTER TABLE public.leads ADD CONSTRAINT leads_name_min_length
  CHECK (char_length(name) >= 2);