
-- Add UNIQUE constraint on payments.mercadopago_payment_id to prevent duplicate payment records
ALTER TABLE public.payments ADD CONSTRAINT payments_mercadopago_payment_id_unique UNIQUE (mercadopago_payment_id);
