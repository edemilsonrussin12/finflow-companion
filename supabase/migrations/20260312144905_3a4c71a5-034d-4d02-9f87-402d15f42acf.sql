
CREATE TABLE public.catalog_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_name text NOT NULL DEFAULT '',
  photo_url text DEFAULT '',
  description text DEFAULT '',
  default_price numeric NOT NULL DEFAULT 0,
  default_quantity numeric NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'Serviços',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own catalog items" ON public.catalog_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own catalog items" ON public.catalog_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catalog items" ON public.catalog_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catalog items" ON public.catalog_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
