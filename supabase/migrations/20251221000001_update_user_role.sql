-- Update user role to instructor based on email
UPDATE public.profiles
SET role = 'instructor'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'aceanalytical01@gmail.com'
);
