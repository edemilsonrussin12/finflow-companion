
-- Add unique constraint on mercadopago_payment_id for payments upsert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_mercadopago_payment_id_key'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_mercadopago_payment_id_key UNIQUE (mercadopago_payment_id);
  END IF;
END $$;
