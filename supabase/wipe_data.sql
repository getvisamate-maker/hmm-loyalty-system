-- Wipe all user data to reset the system for a fresh test run
-- WARNING: This deletes ALL users, cafes, and loyalty cards.

-- 1. Truncate application tables (cascade will handle dependent records)
truncate table public.stamp_logs cascade;
truncate table public.loyalty_cards cascade;
truncate table public.cafes cascade;
truncate table public.profiles cascade;

-- 2. Delete all auth users (this is the root of all user data in Supabase)
-- Note: In a real production Supabase instance, you cannot simply delete from auth.users via SQL editor 
-- without specific permissions or using the management API.
-- However, deleting from public.profiles usually cascades if setup correctly, 
-- but auth.users is special.

-- If you are running this in the Supabase SQL Editor:
delete from auth.users;
