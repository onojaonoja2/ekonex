-- Fix DELETE policies for Instructor Quiz Management (Re-applying with fresh timestamp)

-- Drop existing policies if they exist (to be safe/idempotent)
drop policy if exists "Instructors can delete quizzes" on quizzes;
drop policy if exists "Instructors can delete questions" on questions;
drop policy if exists "Instructors can delete answers" on answers;

-- Quizzes
create policy "Instructors can delete quizzes" on quizzes for delete using (
  exists (
    select 1 from modules 
    join courses on modules.course_id = courses.id
    where modules.id = quizzes.module_id 
    and courses.instructor_id = (select auth.uid())
  )
);

-- Questions
create policy "Instructors can delete questions" on questions for delete using (
  exists (
    select 1 from quizzes
    join modules on quizzes.module_id = modules.id
    join courses on modules.course_id = courses.id
    where quizzes.id = questions.quiz_id
    and courses.instructor_id = (select auth.uid())
  )
);

-- Answers
create policy "Instructors can delete answers" on answers for delete using (
  exists (
    select 1 from questions
    join quizzes on questions.quiz_id = quizzes.id
    join modules on quizzes.module_id = modules.id
    join courses on modules.course_id = courses.id
    where questions.id = answers.question_id
    and courses.instructor_id = (select auth.uid())
  )
);
