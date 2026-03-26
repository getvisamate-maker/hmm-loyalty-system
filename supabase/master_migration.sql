-- ------------------------------------------------------------
-- MASTER MIGRATION SCRIPT (SAFE TO RUN MULITPLE TIMES)
-- This includes all features we just built: Affiliates, Branding, Plans, Security
-- ------------------------------------------------------------

-- 1. AFFILIATES
CREATE TABLE IF NOT EXISTS public.referral_codes (
    code text PRIMARY KEY,
    referrer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(referrer_id)
);
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.profiles(id);

-- 2. CAFE BRANDING & PLANS
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#4f46e5';
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#fbbf24';
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS plan_level text DEFAULT 'standard';

-- 3. CAFE SECURITY & POS
CREATE TABLE IF NOT EXISTS public.cafe_secrets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cafe_id uuid REFERENCES public.cafes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pin_code text,
  secret_key text DEFAULT gen_random_uuid()::text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.cafe_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS security_mode text DEFAULT 'visual';
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS time_lock_hours integer DEFAULT 0;

-- 4. STAMPING LOGIC
ALTER TABLE public.loyalty_cards ADD COLUMN IF NOT EXISTS last_stamped_at timestamptz;
ALTER TABLE public.stamp_logs ADD COLUMN IF NOT EXISTS notes text;

-- 5. ANALYTICS & PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;

-- 6. RLS Policies (Safely creates if not exists logic is hard in pure SQL without DO block, but these are idempotent usually)
-- Cafe Secrets Needs Service Role Only, no public policies needed.

-- Fix for Admin Analytics (allow cafe owners to see logs for their cafe)
DROP POLICY IF EXISTS "Cafe owners can view logs for their cafe" ON public.stamp_logs;
CREATE POLICY "Cafe owners can view logs for their cafe" ON public.stamp_logs FOR SELECT USING (
  auth.uid() IN (
    SELECT owner_id FROM public.cafes 
    WHERE id = (SELECT cafe_id FROM public.loyalty_cards WHERE id = card_id)
  )
);
