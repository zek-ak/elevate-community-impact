-- Complete Schema Fix & Dashboard Refactor (20260312) - Fixed SQL syntax
BEGIN;

-- 1. (Legacy) drop any old auth helper functions if present
--    we keep `otp_codes` table for custom SMS OTP functionality
--    the stub `generate_otp` migration is handled separately.
DROP FUNCTION IF EXISTS public.generate_otp(TEXT, TEXT) CASCADE;
-- other tables (otp_codes, otps, user_sessions) are needed by the
-- custom OTP flow and must not be removed.

-- 2. PLEDGES

-- 2. PLEDGES
CREATE TABLE IF NOT EXISTS public.pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pledge_amount NUMERIC NOT NULL CHECK (pledge_amount >= 0),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE IF EXISTS public.pledges ENABLE ROW LEVEL SECURITY;

-- Drop policies separately
DROP POLICY IF EXISTS "Users can view own pledges" ON public.pledges;
DROP POLICY IF EXISTS "Users can create own pledges" ON public.pledges;
DROP POLICY IF EXISTS "Users can update own pledges" ON public.pledges;
DROP POLICY IF EXISTS "Group leaders can view group pledges" ON public.pledges;
DROP POLICY IF EXISTS "Finance admins can view all pledges" ON public.pledges;
DROP POLICY IF EXISTS "Users own pledges" ON public.pledges;
DROP POLICY IF EXISTS "Group leaders view group" ON public.pledges;
DROP POLICY IF EXISTS "Admins view all" ON public.pledges;

-- Create policies
CREATE POLICY "Users own pledges" ON public.pledges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Group leaders view group" ON public.pledges FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = pledges.user_id AND p.group_id IN (SELECT group_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "Admins view all" ON public.pledges FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('finance_admin', 'super_admin'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON public.pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_pledges_year ON public.pledges(year);

COMMIT;

