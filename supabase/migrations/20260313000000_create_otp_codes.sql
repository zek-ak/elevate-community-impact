-- Ensure otp_codes table exists for custom SMS OTP workflow
-- this migration can be applied on a fresh database or after the
-- schema_fix_and_pledges migration above.

BEGIN;

CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS public.otp_codes ENABLE ROW LEVEL SECURITY;

-- keep any existing policies or add new ones as required (examples):
-- CREATE POLICY "Allow insert otp" ON public.otp_codes FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow read own codes" ON public.otp_codes FOR SELECT USING (true);

COMMIT;
