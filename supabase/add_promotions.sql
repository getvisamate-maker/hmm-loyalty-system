-- Create Promotions Table
create table if not exists public.promotions (
  id uuid default gen_random_uuid() primary key,
  cafe_id uuid references public.cafes(id) on delete cascade not null,
  title text not null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.promotions enable row level security;

-- Policies
-- 1. Owners can insert promotions for their own cafes
create policy "Owners can create promotions for their cafes"
  on public.promotions for insert
  with check (
    exists (
      select 1 from public.cafes
      where id = cafe_id
      and owner_id = auth.uid()
    )
  );

-- 2. Owners can view and manage their own promotions
create policy "Owners can view own promotions"
  on public.promotions for select
  using (
    exists (
      select 1 from public.cafes
      where id = cafe_id
      and owner_id = auth.uid()
    )
  );

create policy "Owners can update own promotions"
  on public.promotions for update
  using (
    exists (
      select 1 from public.cafes
      where id = cafe_id
      and owner_id = auth.uid()
    )
  );

create policy "Owners can delete own promotions"
  on public.promotions for delete
  using (
    exists (
      select 1 from public.cafes
      where id = cafe_id
      and owner_id = auth.uid()
    )
  );

-- 3. Customers can view promotions if:
--    a) they have consented to marketing (checked in app, but policy can enforce)
--    b) AND they are a member of that cafe (loyalty card exists)
create policy "Customers can view promotions for joined cafes"
  on public.promotions for select
  using (
    exists (
      select 1 from public.loyalty_cards
      where user_id = auth.uid()
      and cafe_id = promotions.cafe_id
    )
  );
