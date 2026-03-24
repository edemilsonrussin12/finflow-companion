
-- Portfolio assets table
CREATE TABLE public.portfolio_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset_type text NOT NULL DEFAULT 'outro',
  asset_name text NOT NULL,
  ticker text DEFAULT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  average_price numeric NOT NULL DEFAULT 0,
  total_invested numeric NOT NULL DEFAULT 0,
  purchase_date date DEFAULT NULL,
  notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own portfolio assets" ON public.portfolio_assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio assets" ON public.portfolio_assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio assets" ON public.portfolio_assets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio assets" ON public.portfolio_assets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Portfolio dividends table
CREATE TABLE public.portfolio_dividends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset_id uuid NOT NULL REFERENCES public.portfolio_assets(id) ON DELETE CASCADE,
  dividend_type text NOT NULL DEFAULT 'rendimento',
  amount numeric NOT NULL DEFAULT 0,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_dividends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own dividends" ON public.portfolio_dividends FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dividends" ON public.portfolio_dividends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dividends" ON public.portfolio_dividends FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dividends" ON public.portfolio_dividends FOR DELETE TO authenticated USING (auth.uid() = user_id);
