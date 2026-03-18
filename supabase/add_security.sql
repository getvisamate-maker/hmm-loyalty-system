alter table public.cafes 
  add column security_mode text default 'visual',
  add column time_lock_hours numeric default 2,
  add column pin_code text default '2024';