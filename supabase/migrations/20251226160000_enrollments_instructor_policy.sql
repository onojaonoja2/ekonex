create policy "Instructors can view enrollments for their courses" on enrollments
  for select using (
    exists (
      select 1 from courses
      where courses.id = enrollments.course_id
      and courses.instructor_id = (select auth.uid())
    )
  );
