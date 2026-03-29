CREATE TABLE IF NOT EXISTS public.cafe_staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cafe_id uuid REFERENCES public.cafes(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'Barista',
    pin_code text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    stamps_issued integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cafe_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cafe owners can manage staff" ON public.cafe_staff
FOR ALL USING (
    cafe_id IN (
        SELECT id FROM public.cafes WHERE owner_id = auth.uid()
    )
);
