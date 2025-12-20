-- Create organizations table
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  logo_url text
);

-- Add new columns to profiles FIRST so policies can reference them
alter table profiles 
add column if not exists role text default 'student' check (role in ('student', 'instructor', 'org_admin', 'system_admin')),
add column if not exists organization_id uuid references organizations(id);

-- Enable RLS on organizations
alter table organizations enable row level security;

-- Create Organization Policies
-- System admins can do everything
create policy "System admins can manage all organizations"
  on organizations
  for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'system_admin'
    )
  );

-- Org admins can view their own organization
create policy "Org admins can view their own organization"
  on organizations
  for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() 
      and organization_id = organizations.id
    )
  );

-- Update Profiles RLS to allow reading basic info based on organization
create policy "Org members can view profiles in their organization"
  on profiles
  for select
  using (
    auth.uid() = id -- Own profile
    or 
    (organization_id is not null and organization_id = (select organization_id from profiles where id = auth.uid()))
    or
    (exists (select 1 from profiles where id = auth.uid() and role = 'system_admin'))
  );
