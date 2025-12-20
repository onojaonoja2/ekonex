-- QUIZZES TABLE
create table if not exists quizzes (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references modules(id) on delete cascade not null,
  title text not null,
  passing_score integer default 70,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUESTIONS TABLE
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  text text not null,
  points integer default 10,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ANSWERS TABLE
create table if not exists answers (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references questions(id) on delete cascade not null,
  text text not null,
  is_correct boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUIZ ATTEMPTS TABLE
create table if not exists quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  score integer default 0,
  is_passed boolean default false,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Quizzes
alter table quizzes enable row level security;
create policy "Quizzes are viewable by everyone" on quizzes for select using (true);
create policy "Instructors can insert quizzes" on quizzes for insert with check (
  exists (
    select 1 from modules 
    join courses on modules.course_id = courses.id
    where modules.id = quizzes.module_id 
    and courses.instructor_id = (select auth.uid())
  )
);
-- (Add update/delete policies for instructors similarly if needed, assuming insert is enough for MVP start)

-- Questions
alter table questions enable row level security;
create policy "Questions are viewable by everyone" on questions for select using (true);
create policy "Instructors can insert questions" on questions for insert with check (
  exists (
    select 1 from quizzes
    join modules on quizzes.module_id = modules.id
    join courses on modules.course_id = courses.id
    where quizzes.id = questions.quiz_id
    and courses.instructor_id = (select auth.uid())
  )
);

-- Answers
alter table answers enable row level security;
create policy "Answers are viewable by everyone" on answers for select using (true); 
-- Note: accessible is_correct means students could technically cheat by inspecting network, 
-- but this allows easy "Show Results" UI. 
create policy "Instructors can insert answers" on answers for insert with check (
  exists (
    select 1 from questions
    join quizzes on questions.quiz_id = quizzes.id
    join modules on quizzes.module_id = modules.id
    join courses on modules.course_id = courses.id
    where questions.id = answers.question_id
    and courses.instructor_id = (select auth.uid())
  )
);

-- Quiz Attempts
alter table quiz_attempts enable row level security;
create policy "Users can view their own attempts" on quiz_attempts 
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own attempts" on quiz_attempts 
  for insert with check ((select auth.uid()) = user_id);
-- Instructors can view attempts for their quizzes
create policy "Instructors can view attempts" on quiz_attempts
  for select using (
    exists (
      select 1 from quizzes
      join modules on quizzes.module_id = modules.id
      join courses on modules.course_id = courses.id
      where quizzes.id = quiz_attempts.quiz_id
      and courses.instructor_id = (select auth.uid())
    )
  );
