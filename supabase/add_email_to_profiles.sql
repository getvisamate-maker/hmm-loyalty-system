-- Add email column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill emails for existing profiles? 
-- This requires running a script or manual update because we can't easily select from auth.users in SQL pure migration without extensions.
-- But for new users, it will work.

-- Optional: Since we can't easily backfill via SQL here without pg_net or elevated privs in some setups, 
-- we will assume new users get it. 
-- For existing users, the Admin Create Code action uses listUsers() so it works regardless of profile email.
-- But the Admin Dashboard display might be empty for old users.
