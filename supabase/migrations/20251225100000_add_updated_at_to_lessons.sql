-- Add updated_at to lessons if it doesn't exist
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
