-- 1. Enable RLS on the table (if not already enabled)
alter table loyalty_cards enable row level security;

-- 2. Allow users to CREATE their own loyalty card (Join a program)
create policy "Users can join loyalty programs"
on loyalty_cards for insert
with check (auth.uid() = user_id);

-- 3. Allow users to VIEW their own loyalty cards
create policy "Users can view own cards"
on loyalty_cards for select
using (auth.uid() = user_id);

-- 4. Allow users to UPDATE their own cards (Useful if not using Admin client for everything)
create policy "Users can update own cards"
on loyalty_cards for update
using (auth.uid() = user_id);

-- 5. Allow Cafe Owners to VIEW cards belonging to their cafe
create policy "Owners can view their cafe members"
on loyalty_cards for select
using (
  exists (
    select 1 from cafes
    where cafes.id = loyalty_cards.cafe_id
    and cafes.owner_id = auth.uid()
  )
);

-- 6. Ensure CAFES are publicly readable (so users can see cafe name/logo before joining)
alter table cafes enable row level security;

create policy "Cafes are public"
on cafes for select
using (true);
