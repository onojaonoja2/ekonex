-- Fix infinite recursion in profiles policies caused by self-referencing RLS checks

-- 1. Create a security definer function to get the current user's organization_id safely
-- 'security definer' means this function runs with the privileges of the creator (usually postgres/admin),
-- bypassing the RLS on the profiles table for this specific query.
create or replace function get_my_organization_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id from profiles where id = auth.uid();
$$;

-- 2. Create a security definer function to check if the current user is a system admin safely
create or replace function is_system_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'system_admin');
$$;

-- 3. Drop the problematic recursive policy
drop policy if exists "Org members can view profiles in their organization" on profiles;

-- 4. Recreate the policy using the safe functions
create policy "Org members can view profiles in their organization"
  on profiles
  for select
  using (
    auth.uid() = id -- Own profile
    or 
    (organization_id is not null and organization_id = get_my_organization_id())
    or
    (is_system_admin())
  );
