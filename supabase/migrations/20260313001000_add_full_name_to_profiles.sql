-- ensure profiles table has a full_name column (used for OTP signup)

BEGIN;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS full_name text;

COMMIT;
