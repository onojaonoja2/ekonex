-- Fix infinite recursion in admin policies

-- 1. Create security definer function to check if user is an admin (system or sub)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
    and role in ('system_admin', 'sub_admin')
  );
$$;

-- 2. Create security definer function to check if user is specifically a system admin (reusing/ensuring existence)
create or replace function public.is_system_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
    and role = 'system_admin'
  );
$$;

-- 3. Create security definer function to check if user is specifically a sub admin
create or replace function public.is_sub_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
    and role = 'sub_admin'
  );
$$;

-- 4. Drop problematic policies on PROFILES
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "System Admins can update any profile" on profiles;
drop policy if exists "Sub Admins can update non-admin profiles" on profiles;

-- 5. Recreate PROFILES policies using safe functions
create policy "Admins can view all profiles"
  on profiles
  for select
  using (
    is_admin()
  );

create policy "System Admins can update any profile"
  on profiles
  for update
  using (
    is_system_admin()
  );

create policy "Sub Admins can update non-admin profiles"
  on profiles
  for update
  using (
    is_sub_admin()
    and role in ('student', 'instructor')
  );

-- 6. Drop problematic policies on COURSES (Safe to update these too for consistency)
drop policy if exists "Admins can view all courses" on courses;
drop policy if exists "Admins can update all courses" on courses;
drop policy if exists "Admins can delete all courses" on courses;

-- 7. Recreate COURSES policies
create policy "Admins can view all courses"
  on courses
  for select
  using (
    is_admin()
  );

create policy "Admins can update all courses"
  on courses
  for update
  using (
    is_admin()
  );

create policy "Admins can delete all courses"
  on courses
  for delete
  using (
    is_admin()
  );
