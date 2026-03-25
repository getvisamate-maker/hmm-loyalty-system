-- Add requested_role column to profiles
alter table public.profiles add column if not exists requested_role text;

-- Update the handle_new_user trigger to save the requested_role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, requested_role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'requested_role'
  );
  return new;
end;
$$ language plpgsql security definer;
