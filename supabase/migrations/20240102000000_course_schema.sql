-- COURSES TABLE
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  instructor_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric default 0,
  cover_image text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MODULES TABLE (Sections within a course)
create table if not exists modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LESSONS TABLE (Content within a module)
create table if not exists lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references modules(id) on delete cascade not null,
  title text not null,
  content_type text check (content_type in ('video', 'text')),
  content_url text, -- Video URL or generic content link
  content_text text, -- For text-based lessons
  is_free_preview boolean default false,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENROLLMENTS TABLE
create table if not exists enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- RLS POLICIES

-- Courses:
alter table courses enable row level security;
create policy "Published courses are viewable by everyone." on courses
  for select using (is_published = true);

create policy "Instructors can insert their own courses." on courses
  for insert with check ((select auth.uid()) = instructor_id);

create policy "Instructors can update their own courses." on courses
  for update using ((select auth.uid()) = instructor_id);

create policy "Instructors can delete their own courses." on courses
  for delete using ((select auth.uid()) = instructor_id);

-- Modules:
alter table modules enable row level security;
create policy "Modules are viewable if course is published" on modules
  for select using (
    exists (
      select 1 from courses where id = modules.course_id and is_published = true
    )
  );
create policy "Instructors can manage modules for their courses" on modules
  for all using (
    exists (
      select 1 from courses where id = modules.course_id and instructor_id = (select auth.uid())
    )
  );

-- Lessons:
alter table lessons enable row level security;
create policy "Lessons are viewable if course is published" on lessons
  for select using (
    exists (
      select 1 from modules
      join courses on modules.course_id = courses.id
      where modules.id = lessons.module_id and courses.is_published = true
    )
  );
create policy "Instructors can manage lessons for their courses" on lessons
  for all using (
    exists (
      select 1 from modules
      join courses on modules.course_id = courses.id
      where modules.id = lessons.module_id and courses.instructor_id = (select auth.uid())
    )
  );

-- Enrollments:
alter table enrollments enable row level security;
create policy "Users can view their own enrollments" on enrollments
  for select using ((select auth.uid()) = user_id);

create policy "Users can enroll themselves" on enrollments
  for insert with check ((select auth.uid()) = user_id);
-- (Optional: Instructors might want to see who is enrolled in their course, but skipping for MVP simplicity or add later)
