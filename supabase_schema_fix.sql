-- Run this in the Supabase Dashboard SQL Editor to fix the POS and Staff features

-- 1. Fix cafe_secrets to support dynamic POS generation
ALTER TABLE cafe_secrets ADD COLUMN IF NOT EXISTS secret_key TEXT;

-- 2. Create cafe_staff for the robust Pro Plan management system
CREATE TABLE IF NOT EXISTS cafe_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'barista',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE cafe_staff ENABLE ROW LEVEL SECURITY;

-- 4. Add security policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cafe_staff' AND policyname = 'Cafes can manage their own staff'
  ) THEN
    CREATE POLICY "Cafes can manage their own staff" ON cafe_staff
    FOR ALL USING (
      cafe_id IN (
        SELECT id FROM cafes WHERE owner_id = auth.uid()
      )
    );
  END IF;
END
$$;
