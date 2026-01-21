-- Update roles to include sub_admin
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check 
  check (role in ('student', 'instructor', 'org_admin', 'system_admin', 'sub_admin'));

-- Add status to profiles
alter table profiles 
add column if not exists status text default 'active' check (status in ('active', 'suspended'));

-- Add is_paused to courses
alter table courses 
add column if not exists is_paused boolean default false;

-- RLS POLICIES for Admin Features

-- 1. System Admins and Sub Admins have broad access
-- Note: 'sub_admin' generally has read access to everything, but write access checks might differ.

-- Profiles: Admins can view all profiles
create policy "Admins can view all profiles"
  on profiles
  for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('system_admin', 'sub_admin')
    )
  );

-- Profiles: System Admins can update anyone (e.g. to suspend them)
create policy "System Admins can update any profile"
  on profiles
  for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'system_admin'
    )
  );

-- Profiles: Sub Admins can update students/instructors (but not other admins)
create policy "Sub Admins can update non-admin profiles"
  on profiles
  for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'sub_admin'
    )
    and role in ('student', 'instructor') -- The role of the record being updated
  );

-- Courses: Admins can view all courses (even unpublished)
create policy "Admins can view all courses"
  on courses
  for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('system_admin', 'sub_admin')
    )
  );

-- Courses: Admins can update courses (e.g. to pause)
create policy "Admins can update all courses"
  on courses
  for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('system_admin', 'sub_admin')
    )
  );

-- Courses: Admins can delete courses
create policy "Admins can delete all courses"
  on courses
  for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('system_admin', 'sub_admin')
    )
  );
