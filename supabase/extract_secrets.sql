-- Create a table for sensitive cafe data
create table if not exists public.cafe_secrets (
  cafe_id uuid references public.cafes(id) on delete cascade primary key,
  pin_code text default '2024',
  created_at timestamp with time zone default now()
);

alter table public.cafe_secrets enable row level security;

-- Policies (Wrapped in DO blocks to be re-run safe)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'cafe_secrets' and policyname = 'Owners can view secrets') then
    create policy "Owners can view secrets" on public.cafe_secrets
      for select using (
        exists (
          select 1 from public.cafes
          where id = cafe_secrets.cafe_id and owner_id = auth.uid()
        )
      );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'cafe_secrets' and policyname = 'Owners can update secrets') then
    create policy "Owners can update secrets" on public.cafe_secrets
      for update using (
        exists (
          select 1 from public.cafes
          where id = cafe_secrets.cafe_id and owner_id = auth.uid()
        )
      );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'cafe_secrets' and policyname = 'Owners can insert secrets') then
    create policy "Owners can insert secrets" on public.cafe_secrets
      for insert with check (
        exists (
          select 1 from public.cafes
          where id = cafe_secrets.cafe_id and owner_id = auth.uid()
        )
      );
  end if;
end $$;

-- Migrate existing data (Safe to run multiple times if column exists)
do $$
begin
  if exists(select 1 from information_schema.columns where table_name='cafes' and column_name='pin_code') then
    insert into public.cafe_secrets (cafe_id, pin_code)
    select id, pin_code from public.cafes
    on conflict (cafe_id) do nothing;
  end if;
end $$;

-- Drop the column from the public table (making it safe)
-- Commented out to prevent accidental data loss during dev, but execute this manually or uncomment for production
-- alter table public.cafes drop column if exists pin_code;
