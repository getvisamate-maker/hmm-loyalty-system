-- Create new table for referral codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL, -- e.g. "CANBERRA20"
  referrer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add affiliate linking to cafes
ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_cafes_affiliate_id ON public.cafes(affiliate_id);

-- RLS: Referral Codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read codes (to validate them on signup)
CREATE POLICY "Referral codes are public read" 
ON public.referral_codes FOR SELECT USING (true);

-- Only owners can update their usage (via function preferrably, but for now simple update)
-- Actually, usage count should probably be updated by system function/trigger to avoid tampering.
-- Let's just allow read for now. The backend action will use Service Role to increment.

-- Only Admins or the user themselves can create codes
CREATE POLICY "Users can create own codes" 
ON public.referral_codes FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

-- Only Admins or the user can delete/update
CREATE POLICY "Users can manage own codes" 
ON public.referral_codes FOR ALL 
USING (auth.uid() = referrer_id);
