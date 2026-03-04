-- Update handle_new_user to work with email signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.phone
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure contribution trigger exists
DROP TRIGGER IF EXISTS on_contribution_inserted ON public.contributions;
CREATE TRIGGER on_contribution_inserted
  AFTER INSERT ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.process_contribution();

-- Seed some sample data for testing
INSERT INTO public.groups (name) VALUES ('Faith Warriors'), ('Living Waters'), ('Kingdom Builders')
ON CONFLICT DO NOTHING;

INSERT INTO public.projects (name, description, target_amount, status) 
VALUES ('New Community Center', 'Building a modern community center for worship, fellowship, and outreach programs.', 200000, 'ongoing')
ON CONFLICT DO NOTHING;

INSERT INTO public.badges (id, name, icon, description, threshold_percent) VALUES
  ('first', 'First Step', '⭐', 'Made your first contribution', 0),
  ('quarter', '25% There', '🔥', 'Reached 25% of your goal', 25),
  ('half', 'Halfway Hero', '🎯', 'Reached 50% of your goal', 50),
  ('three_quarter', 'Almost There', '🚀', 'Reached 75% of your goal', 75),
  ('complete', 'Goal Crusher', '🏆', 'Completed your annual goal!', 100),
  ('streak7', 'Weekly Warrior', '💎', '7-day contribution streak', NULL),
  ('streak30', 'Monthly Champion', '🌟', '30-day contribution streak', NULL)
ON CONFLICT (id) DO NOTHING;