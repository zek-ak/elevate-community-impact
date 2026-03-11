
-- ==========================================
-- OTP AUTHENTICATION SYSTEM
-- ==========================================

-- Enable pgcrypto extension (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- DROP EXISTING TABLES AND FUNCTIONS
-- ==========================================

DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.otps CASCADE;

DROP FUNCTION IF EXISTS public.generate_otp(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.verify_otp(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.login_with_phone(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.validate_session(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.invalidate_session(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_by_phone(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_tokens() CASCADE;

-- ==========================================
-- CREATE TABLES
-- ==========================================

-- OTP Storage Table
CREATE TABLE public.otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  full_name TEXT,
  otp_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false
);

-- User Sessions Table
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Generate OTP for signup (internal, not sent via SMS)
CREATE OR REPLACE FUNCTION public.generate_otp(_phone TEXT, _full_name TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _otp TEXT;
  _otp_hash TEXT;
  _salt TEXT;
  _expires_at TIMESTAMPTZ;
BEGIN
  IF _phone IS NULL OR length(_phone) < 9 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid phone number');
  END IF;

  _phone := regexp_replace(_phone, '[^0-9]', '', 'g');

  -- Invalidate any existing unused OTPs for this phone
  UPDATE public.otps 
  SET used = true 
  WHERE phone = _phone AND used = false AND expires_at > now();

  -- Generate 6-digit OTP using random()
  _otp := lpad(floor(random() * 900000 + 100000)::TEXT, 6, '0');
  
  -- Generate a random salt using md5 of random values and hash the OTP using md5
  _salt := md5(random()::TEXT || now()::TEXT);
  _otp_hash := _salt || ':' || md5(_otp || _salt);
  
  _expires_at := now() + interval '5 minutes';
  
  INSERT INTO public.otps (phone, full_name, otp_hash, expires_at)
  VALUES (_phone, _full_name, _otp_hash, _expires_at);

  RETURN json_build_object(
    'success', true,
    'otp', _otp,
    'expires_at', _expires_at,
    'phone', _phone
  );
END;
$$;

-- Verify OTP and create user + session (for signup)
CREATE OR REPLACE FUNCTION public.verify_otp(_phone TEXT, _otp_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _otp_record RECORD;
  _user_record RECORD;
  _session_token TEXT;
  _expires_at TIMESTAMPTZ;
  _new_user_id UUID;
  _stored_salt TEXT;
  _stored_hash TEXT;
  _computed_hash TEXT;
BEGIN
  IF _phone IS NULL OR _otp_code IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Phone and OTP required');
  END IF;

  _phone := regexp_replace(_phone, '[^0-9]', '', 'g');

  -- Find valid OTP
  SELECT * INTO _otp_record
  FROM public.otps
  WHERE phone = _phone 
    AND used = false 
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF _otp_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;

  -- Extract salt and hash from stored value (format: salt:hash)
  _stored_salt := split_part(_otp_record.otp_hash, ':', 1);
  _stored_hash := split_part(_otp_record.otp_hash, ':', 2);
  
  -- Compute hash of provided OTP with extracted salt using md5
  _computed_hash := md5(_otp_code || _stored_salt);

  -- Verify OTP
  IF _computed_hash <> _stored_hash THEN
    RETURN json_build_object('success', false, 'error', 'Invalid code');
  END IF;

  -- Mark OTP as used and verified
  UPDATE public.otps SET used = true, is_verified = true WHERE id = _otp_record.id;

  -- Check if user already exists
  SELECT * INTO _user_record
  FROM public.profiles
  WHERE phone = _phone;

  IF _user_record IS NULL THEN
    -- Create new user with the full name from OTP
    _new_user_id := gen_random_uuid();
    
    INSERT INTO public.profiles (id, full_name, phone, category)
    VALUES (_new_user_id, COALESCE(_otp_record.full_name, 'New Member'), _phone, 'church_member')
    RETURNING * INTO _user_record;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_record.id, 'member');
  END IF;

  -- Generate session token using md5
  _session_token := md5(random()::TEXT || now()::TEXT || _phone || _user_record.id::TEXT);
  _expires_at := now() + interval '1 hour';
  
  INSERT INTO public.user_sessions (user_id, token, expires_at)
  VALUES (_user_record.id, _session_token, _expires_at);

  RETURN json_build_object(
    'success', true,
    'session_token', _session_token,
    'user_id', _user_record.id,
    'user', json_build_object(
      'id', _user_record.id,
      'full_name', _user_record.full_name,
      'phone', _user_record.phone,
      'category', _user_record.category
    ),
    'expires_at', _expires_at
  );
END;
$$;

-- Login with phone only (no OTP required after signup)
CREATE OR REPLACE FUNCTION public.login_with_phone(_phone TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_record RECORD;
  _session_token TEXT;
  _expires_at TIMESTAMPTZ;
BEGIN
  IF _phone IS NULL OR length(_phone) < 9 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid phone number');
  END IF;

  _phone := regexp_replace(_phone, '[^0-9]', '', 'g');

  -- Find user by phone
  SELECT * INTO _user_record
  FROM public.profiles
  WHERE phone = _phone;

  IF _user_record IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'User not found. Please sign up first.'
    );
  END IF;

  -- Generate session token using md5
  _session_token := md5(random()::TEXT || now()::TEXT || _phone || _user_record.id::TEXT);
  _expires_at := now() + interval '1 hour';
  
  INSERT INTO public.user_sessions (user_id, token, expires_at)
  VALUES (_user_record.id, _session_token, _expires_at);

  RETURN json_build_object(
    'success', true,
    'session_token', _session_token,
    'user_id', _user_record.id,
    'user', json_build_object(
      'id', _user_record.id,
      'full_name', _user_record.full_name,
      'phone', _user_record.phone,
      'category', _user_record.category
    ),
    'expires_at', _expires_at
  );
END;
$$;

-- Validate session
CREATE OR REPLACE FUNCTION public.validate_session(_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row RECORD;
BEGIN
  IF _token IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Token required');
  END IF;

  -- Select session joined with user info into a single record
  SELECT s.*, p.full_name, p.phone, p.category
  INTO _row
  FROM public.user_sessions s
  JOIN public.profiles p ON p.id = s.user_id
  WHERE s.token = _token
    AND s.expires_at > now()
  LIMIT 1;

  -- If no session found
  IF _row IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid or expired session');
  END IF;

  -- Return session info and user details
  RETURN json_build_object(
    'valid', true,
    'user_id', _row.user_id,
    'user', json_build_object(
        'id', _row.user_id,
        'full_name', _row.full_name,
        'phone', _row.phone,
        'category', _row.category
    ),
    'expires_at', _row.expires_at
  );
END;
$$;

-- Invalidate session (logout)
CREATE OR REPLACE FUNCTION public.invalidate_session(_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_sessions WHERE token = _token;
  RETURN json_build_object('success', true, 'message', 'Logged out');
END;
$$;

-- Get user by phone
CREATE OR REPLACE FUNCTION public.get_user_by_phone(_phone TEXT)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user RECORD;
BEGIN
  _phone := regexp_replace(_phone, '[^0-9]', '', 'g');
  
  SELECT id, full_name, phone, category INTO _user
  FROM public.profiles
  WHERE phone = _phone
  LIMIT 1;

  IF _user IS NULL THEN
    RETURN json_build_object('exists', false);
  END IF;

  RETURN json_build_object(
    'exists', true,
    'user', json_build_object(
      'id', _user.id,
      'full_name', _user.full_name,
      'phone', _user.phone,
      'category', _user.category
    )
  );
END;
$$;

-- Cleanup expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _otp_count INTEGER;
  _session_count INTEGER;
BEGIN
  DELETE FROM public.otps WHERE expires_at < now();
  GET DIAGNOSTICS _otp_count = ROW_COUNT;

  DELETE FROM public.user_sessions WHERE expires_at < now();
  GET DIAGNOSTICS _session_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'otps_deleted', _otp_count,
    'sessions_deleted', _session_count
  );
END;
$$;

-- ==========================================
-- RLS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Allow OTP insertion" ON public.otps;
DROP POLICY IF EXISTS "Allow OTP update" ON public.otps;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow session insertion" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow session deletion" ON public.user_sessions;

CREATE POLICY "Allow OTP insertion" ON public.otps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow OTP update" ON public.otps
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow session insertion" ON public.user_sessions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow session deletion" ON public.user_sessions
  FOR DELETE USING (true);

-- ==========================================
-- INDEXES
-- ==========================================

DROP INDEX IF EXISTS idx_otps_phone;
DROP INDEX IF EXISTS idx_otps_expires;
DROP INDEX IF EXISTS idx_user_sessions_token;
DROP INDEX IF EXISTS idx_user_sessions_user_id;
DROP INDEX IF EXISTS idx_user_sessions_expires;

CREATE INDEX idx_otps_phone ON public.otps(phone) WHERE used = false;
CREATE INDEX idx_otps_expires ON public.otps(expires_at) WHERE used = false;
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);

