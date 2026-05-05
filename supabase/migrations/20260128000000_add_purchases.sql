-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  reference text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- create policy "Users can view their own purchases"
CREATE POLICY "Users can view their own purchases" 
ON public.purchases FOR SELECT 
USING (auth.uid() = user_id);

-- create policy "Service role can manage purchases"
-- implicit in supabase, but good to be explicit for other roles if needed, 
-- but usually service_role bypasses RLS. 
-- We might need insert policy if we want to allow creating pending purchases from client side?
-- Actually, we'll probably create pending purchase via API (service role) or let client create it?
-- The plan says "Creates a pending record in purchases" in /api/paystack/initialize.
-- If that backend route uses service role, we don't need INSERT policy for authenticated users.
-- But if we want to be safe, we can allow users to read.

-- Grant permissions
GRANT SELECT ON public.purchases TO authenticated;
GRANT SELECT ON public.purchases TO service_role;
GRANT ALL ON public.purchases TO service_role; -- Ensure service role can insert/update

-- Add comment
COMMENT ON TABLE public.purchases IS 'Tracks Paystack payment transactions for courses';
