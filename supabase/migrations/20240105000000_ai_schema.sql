-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade not null,
  content text, -- The text content chunk
  embedding vector(1536) -- OpenAI embedding size
);

-- RLS
alter table embeddings enable row level security;
create policy "Embeddings are viewable by everyone" on embeddings for select using (true);
create policy "Instructors can insert embeddings" on embeddings for insert with check (
  exists (
    select 1 from lessons
    join modules on lessons.module_id = modules.id
    join courses on modules.course_id = courses.id
    where lessons.id = embeddings.lesson_id
    and courses.instructor_id = (select auth.uid())
  )
);
-- Add update/delete policies if needed

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  lesson_id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    embeddings.id,
    embeddings.lesson_id,
    embeddings.content,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
