

## Migration Plan: localStorage → Supabase Auth + Database

### Overview
Replace the mock auth and localStorage persistence with real Supabase authentication and database storage, keeping all existing UI intact.

### Step 1: Enable Lovable Cloud
Connect the project to Lovable Cloud (Supabase) to get the backend infrastructure. This provides the Supabase client, auth, and database.

### Step 2: Database Schema (Migrations)

**profiles table** — auto-created on signup via trigger:
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**transactions table**:
```sql
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  date date not null,
  category text not null,
  description text not null,
  is_recurring boolean default false,
  recurrence_frequency text check (recurrence_frequency in ('weekly', 'monthly', 'yearly')),
  recurrence_paused boolean default false,
  recurrence_group_id text,
  created_at timestamptz default now()
);
alter table public.transactions enable row level security;
create policy "Users CRUD own transactions" on public.transactions for all using (auth.uid() = user_id);
```

**sales table**:
```sql
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product text not null,
  quantity integer not null check (quantity > 0),
  total_value numeric not null check (total_value > 0),
  date date not null,
  created_at timestamptz default now()
);
alter table public.sales enable row level security;
create policy "Users CRUD own sales" on public.sales for all using (auth.uid() = user_id);
```

### Step 3: Replace AuthContext
Rewrite `src/contexts/AuthContext.tsx` to use Supabase Auth:
- `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`, `resetPasswordForEmail()`
- `onAuthStateChange` listener for session state
- Expose `user`, `isAuthenticated`, `loading` state
- Keep same interface shape so consumer components need minimal changes

### Step 4: Create `/reset-password` page
New page at `src/pages/ResetPassword.tsx` that:
- Detects `type=recovery` in URL hash
- Shows new password form
- Calls `supabase.auth.updateUser({ password })`
- Add route in App.tsx

### Step 5: Update Auth Pages
- **Login.tsx**: Replace `login()` call with `supabase.auth.signInWithPassword()`
- **Cadastro.tsx**: Replace `signup()` call with `supabase.auth.signUp()`
- **ResetSenha.tsx**: Replace mock with `supabase.auth.resetPasswordForEmail()`
- All pages keep their current UI, just swap the auth calls

### Step 6: Replace FinanceContext
Rewrite `src/contexts/FinanceContext.tsx`:
- Remove localStorage, use Supabase queries
- Fetch transactions/sales with `supabase.from('transactions').select()` filtered by user
- CRUD operations use `insert`, `update`, `delete` on Supabase
- Use React Query or `useEffect` for data fetching with loading states
- Map between snake_case DB columns and camelCase TypeScript types
- Keep the same context interface (`transactions`, `addTransaction`, etc.)

### Step 7: Update ProtectedRoute
- Add loading state handling (show spinner while auth session loads)
- Keep redirect to `/login` when not authenticated

### Step 8: Update App.tsx
- Add `/reset-password` as public route
- Wrap with Supabase client provider (from `src/integrations/supabase`)

### Files Changed
- `src/contexts/AuthContext.tsx` — full rewrite (Supabase auth)
- `src/contexts/FinanceContext.tsx` — full rewrite (Supabase DB)
- `src/pages/Login.tsx` — swap auth calls
- `src/pages/Cadastro.tsx` — swap auth calls
- `src/pages/ResetSenha.tsx` — swap to real password reset
- `src/pages/ResetPassword.tsx` — new (set new password)
- `src/components/ProtectedRoute.tsx` — add loading state
- `src/App.tsx` — add reset-password route
- `src/integrations/supabase/` — auto-generated client (from Lovable Cloud)

### Files NOT Changed
All UI components (`Dashboard.tsx`, `Gastos.tsx`, `Vendas.tsx`, `Investimentos.tsx`, `TransactionForm.tsx`, `SaleForm.tsx`, `TransactionItem.tsx`, `BottomNav.tsx`, `AppLayout.tsx`, `FloatingActionButton.tsx`) remain untouched — they consume the same context interface.

### Prerequisites
Lovable Cloud must be enabled on the project before implementation begins.

