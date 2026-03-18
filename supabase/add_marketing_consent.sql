ALTER TABLE public.profiles ADD COLUMN marketing_consent boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, marketing_consent)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'marketing_consent')::boolean
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to owners to see profiles of users who have their loyalty cards
DROP POLICY IF EXISTS "Cafe owners can view profiles of their customers" ON public.profiles;
CREATE POLICY "Cafe owners can view profiles of their customers" 
ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.loyalty_cards lc
    JOIN public.cafes c ON c.id = lc.cafe_id
    WHERE lc.user_id = profiles.id AND c.owner_id = auth.uid()
  )
);
