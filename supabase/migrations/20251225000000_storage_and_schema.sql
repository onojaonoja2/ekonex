-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('course-content', 'course-content', true),
  ('course-covers', 'course-covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Avatars: Everyone can read, Authenticated users can upload
CREATE POLICY "Avatar Public Read" ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Avatar Auth Update" ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Course Covers: Everyone can read, Instructors can upload
CREATE POLICY "Cover Public Read" ON storage.objects FOR SELECT
USING ( bucket_id = 'course-covers' );

CREATE POLICY "Cover Instructor Upload" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'course-covers' AND auth.role() = 'authenticated' ); -- Simplified to auth for now, can be restricted to instructor role if needed

-- Course Content: Members can read, Instructors can upload
-- For simplicity in this demo, making content public-read or strictly controlled by app logic. 
-- Ideally, it should be restricted to enrolled users, but Supabase Storage RLS doesn't easily join with app tables (enrollments) efficiently without wrapper functions.
-- We will use Public Read for now for simplicity of rendering in `<img>` tags, or Authenticated Read.
CREATE POLICY "Content Public Read" ON storage.objects FOR SELECT
USING ( bucket_id = 'course-content' );

CREATE POLICY "Content Instructor Upload" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'course-content' AND auth.role() = 'authenticated' );


-- Schema Updates
-- Add content_blocks to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS content_blocks jsonb DEFAULT '[]'::jsonb;

-- Add comment to explain structure
COMMENT ON COLUMN public.lessons.content_blocks IS 'Array of content blocks: {type: "text"|"image"|"code"|"pdf"|"slides", content: string, meta?: any}';
