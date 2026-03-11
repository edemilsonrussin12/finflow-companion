ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS quote_number serial;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS client_contact text DEFAULT '';