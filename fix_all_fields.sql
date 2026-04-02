ALTER TABLE public.cafes
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS security_mode text default 'visual',
  ADD COLUMN IF NOT EXISTS pin_code text default '0000',
  ADD COLUMN IF NOT EXISTS time_lock_hours numeric default 2,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#4f46e5',
  ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#fbbf24',
  ADD COLUMN IF NOT EXISTS stamp_icon text DEFAULT 'coffee',
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'glassmorphism',
  ADD COLUMN IF NOT EXISTS background_url text;

-- Force supabase schema cache refresh
NOTIFY pgrst, 'reload schema';
