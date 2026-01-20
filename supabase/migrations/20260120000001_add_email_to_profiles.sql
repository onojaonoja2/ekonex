-- Add email column to profiles
alter table profiles 
add column if not exists email text;

-- Update the handle_new_user function to include email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Backfill existing profiles with email from auth.users
-- Note: This requires the migration to run with privileges to access auth.users
do $$
begin
  update profiles
  set email = users.email
  from auth.users
  where profiles.id = users.id
  and profiles.email is null;
end $$;
