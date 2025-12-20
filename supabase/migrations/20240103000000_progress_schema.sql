-- USER PROGRESS TABLE
create table if not exists user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  is_completed boolean default false,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- RLS POLICIES
alter table user_progress enable row level security;

create policy "Users can view their own progress" on user_progress
  for select using ((select auth.uid()) = user_id);

create policy "Users can update their own progress" on user_progress
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress records" on user_progress
  for update using ((select auth.uid()) = user_id);

-- OPTIONAL: Instructor view
-- Instructors might want to see progress for students in their courses.
-- This requires a join through lessons -> modules -> courses -> instructor_id
create policy "Instructors can view student progress" on user_progress
  for select using (
    exists (
      select 1 from lessons
      join modules on lessons.module_id = modules.id
      join courses on modules.course_id = courses.id
      where lessons.id = user_progress.lesson_id
      and courses.instructor_id = (select auth.uid())
    )
  );
