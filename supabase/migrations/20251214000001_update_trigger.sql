-- Update the handle_new_user function to copy 'role' and 'organization_id' from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, organization_id)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'student'), -- Default to student if missing
    (new.raw_user_meta_data->>'organization_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
