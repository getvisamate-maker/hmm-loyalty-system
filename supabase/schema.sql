-- Create profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create cafes table
create table public.cafes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null, -- e.g., 'joe-coffee' for the QR code URL
  owner_id uuid references public.profiles(id) on delete cascade not null,
  stamps_required integer default 10 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create loyalty cards table
create table public.loyalty_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  cafe_id uuid references public.cafes(id) on delete cascade not null,
  stamp_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, cafe_id) -- A user can only have one active card per cafe
);

-- Create stamp history logs (for analytics and fraud prevention)
create table public.stamp_logs (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references public.loyalty_cards(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.cafes enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.stamp_logs enable row level security;

-- ----- RLS POLICIES -----
-- Profiles: Users can read and update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Cafes: Anyone can view cafes. Only owners can edit.
create policy "Cafes are viewable by everyone" on public.cafes for select using (true);
create policy "Cafe owners can insert their cafes." on public.cafes for insert with check (auth.uid() = owner_id);
create policy "Cafe owners can update their cafes." on public.cafes for update using (auth.uid() = owner_id);

-- Loyalty Cards: Users can view their own cards. Owners can view cards for their cafe.
create policy "Users can view their own cards" on public.loyalty_cards for select using (auth.uid() = user_id);
create policy "Cafe owners can view cards for their cafe" on public.loyalty_cards for select using (
  auth.uid() in (select owner_id from public.cafes where id = cafe_id)
);
-- Note: We will handle inserting and updating cards via secure Server Actions in Next.js

-- Setup a trigger to auto-create a profile whenever a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();