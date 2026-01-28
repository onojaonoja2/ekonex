-- Allow authenticated users to insert their own purchases
CREATE POLICY "Users can insert their own purchases"
ON public.purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure reference is unique (already defined in table, but good to double check or add index if needed for performance, but table def handles it)
