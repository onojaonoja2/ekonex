-- Allow instructors to view profiles of students enrolled in their courses
drop policy if exists "Instructors can view enrolled student profiles" on profiles;

create policy "Instructors can view enrolled student profiles"
  on profiles
  for select
  using (
    exists (
      select 1 from enrollments
      join courses on enrollments.course_id = courses.id
      where enrollments.user_id = profiles.id
      and courses.instructor_id = (select auth.uid())
    )
  );

-- Allow instructors to view progress of students enrolled in their courses
drop policy if exists "Instructors can view student progress" on user_progress;

create policy "Instructors can view student progress"
  on user_progress
  for select
  using (
    exists (
      select 1 from lessons
      join modules on lessons.module_id = modules.id
      join courses on modules.course_id = courses.id
      where lessons.id = user_progress.lesson_id
      and courses.instructor_id = (select auth.uid())
    )
  );
