-- 1. Affiliate RLS for cafes
CREATE POLICY "Affiliates can view their referred cafes" 
ON cafes 
FOR SELECT 
TO authenticated 
USING (affiliate_id = auth.uid());
