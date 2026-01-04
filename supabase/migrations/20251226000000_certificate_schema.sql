-- CERTIFICATES TABLE
create table if not exists certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null,
  certificate_code text unique not null,
  unique(user_id, course_id)
);

-- RLS POLICIES
alter table certificates enable row level security;

create policy "Users can view their own certificates" on certificates
  for select using ((select auth.uid()) = user_id);

-- Only server-side logic (or admins) should insert certificates usually, 
-- but for simplicity in this MVP we'll allow the service role (implicit) 
-- and potentially authenticated users if we handle verification strictly in the action.
-- However, strict RLS for insert is better:
-- Right now, we might rely on a postgres function or just service role for issuance.
-- Let's allow users to insert IF they really completed it (hard to enforce in simple RLS without function).
-- For now, we'll keep insert restricted and assume the server action runs with appropriate privileges or we add a policy if needed.
-- Actually, typically we want the backend to issue it. The user shouldn't just "insert" a certificate.
-- So we won't add an insert policy for public/authenticated users directly unless they prove completion.
-- We'll assume the `checkAndIssueCertificate` action uses a `supabaseAdmin` client or similar, 
-- OR we allow insert if the user checks out.
-- Let's stick to: Users can READ their own.

create policy "Instructors can view certificates for their courses" on certificates
  for select using (
    exists (
      select 1 from courses
      where courses.id = certificates.course_id
      and courses.instructor_id = (select auth.uid())
    )
  );
