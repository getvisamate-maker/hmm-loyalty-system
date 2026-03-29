-- Force drop existing and add comprehensive policies for referral_codes
DROP POLICY IF EXISTS "Referral codes are public read" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can view own referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Anyone can read codes" ON public.referral_codes;

CREATE POLICY "Anyone can read codes"
ON public.referral_codes
FOR SELECT
USING (true);

-- And also just in case we need one explicitly for the owner:
CREATE POLICY "Users can view own referral codes"
ON public.referral_codes
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);
