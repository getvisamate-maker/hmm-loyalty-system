-- 1. Ensure referral_codes RLS allows users to see their own codes
DROP POLICY IF EXISTS "Users can view own referral codes" ON public.referral_codes;
CREATE POLICY "Users can view own referral codes" 
ON public.referral_codes 
FOR SELECT 
TO authenticated 
USING (referrer_id = auth.uid());

-- 2. Ensure cafes RLS allows affiliates to view their referred cafes
DROP POLICY IF EXISTS "Affiliates can view their referred cafes" ON public.cafes;
CREATE POLICY "Affiliates can view their referred cafes" 
ON public.cafes 
FOR SELECT 
TO authenticated 
USING (affiliate_id = auth.uid());
