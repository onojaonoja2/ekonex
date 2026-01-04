create policy "Users can insert their own certificates" on certificates
  for insert with check ((select auth.uid()) = user_id);
