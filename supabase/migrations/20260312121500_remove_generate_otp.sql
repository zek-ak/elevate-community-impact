-- Remove legacy generate_otp stub so that mis‑routed calls no longer return confusing message
DROP FUNCTION IF EXISTS public.generate_otp(TEXT, TEXT) CASCADE;
