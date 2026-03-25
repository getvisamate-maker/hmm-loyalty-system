-- -----------------------------------------------------------------------------
-- 1. ADD AUTHORIZATION FLAGGING
-- -----------------------------------------------------------------------------
-- Add a column to profiles to designate who is allowed to create cafes
alter table profiles 
add column if not exists is_partner boolean default false;

-- -----------------------------------------------------------------------------
-- 2. SECURE CAFE CREATION
-- -----------------------------------------------------------------------------
-- Enable RLS (if not already on)
alter table cafes enable row level security;

-- Drop insecure policies if they exist (e.g., "Enable insert for authenticated users only")
drop policy if exists "Enable insert for authenticated users only" on cafes;
drop policy if exists "Authenticated users can insert cafes" on cafes;

-- Create STRICT insert policy: Only users marked as 'is_partner' can create a cafe
create policy "Only partners can create cafes"
on cafes for insert
with check (
  auth.uid() = owner_id 
  and exists (
    select 1 from profiles
    where id = auth.uid()
    and is_partner = true
  )
);

-- Ensure owners can only update their OWN cafes
drop policy if exists "Owners can update their own cafes" on cafes;
create policy "Owners can update their own cafes"
on cafes for update
using (auth.uid() = owner_id);

-- Everyone can READ cafes (needed for the public loyalty card page)
drop policy if exists "Cafes are viewable by everyone" on cafes;
create policy "Cafes are viewable by everyone"
on cafes for select
using (true);

-- -----------------------------------------------------------------------------
-- 3. SECURE LOYALTY CARDS (Double Check)
-- -----------------------------------------------------------------------------
alter table loyalty_cards enable row level security;

-- Users can only see their own cards
drop policy if exists "Users can view own cards" on loyalty_cards;
create policy "Users can view own cards"
on loyalty_cards for select
using (auth.uid() = user_id);

-- Cafe Owners can see cards belonging to their cafe
drop policy if exists "Cafe owners can view their customers" on loyalty_cards;
create policy "Cafe owners can view their customers"
on loyalty_cards for select
using (
  exists (
    select 1 from cafes
    where cafes.id = loyalty_cards.cafe_id
    and cafes.owner_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- 4. HOW TO ONBOARD A PILOT CAFE
-- -----------------------------------------------------------------------------
-- When a cafe owner signs up, their 'is_partner' will be FALSE by default.
-- They cannot create a cafe.
--
-- TO APPROVE THEM:
-- Go to Supabase > Table Editor > profiles
-- Find their user row and set 'is_partner' to TRUE.
-- Ask them to refresh, and they can now create their cafe.
