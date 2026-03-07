-- Allow investment transactions in the unified transactions source-of-truth table
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_type_check
CHECK (type IN ('income', 'expense', 'investment'));