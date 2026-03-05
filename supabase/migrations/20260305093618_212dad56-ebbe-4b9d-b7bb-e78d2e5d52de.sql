CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, category)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.phone,
    COALESCE(
      CASE WHEN NEW.raw_user_meta_data->>'category' IN ('visitor', 'student', 'church_member', 'regular')
           THEN (NEW.raw_user_meta_data->>'category')::member_category
           ELSE 'church_member'::member_category
      END,
      'church_member'::member_category
    )
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$function$;