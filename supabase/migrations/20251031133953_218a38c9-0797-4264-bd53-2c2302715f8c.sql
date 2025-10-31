-- Fix function search paths for security

CREATE OR REPLACE FUNCTION public.clear_current_month_data(month integer, year integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Delete meal entries for the specified month and year
  DELETE FROM public.meal_entries 
  WHERE EXTRACT(MONTH FROM date) = month 
  AND EXTRACT(YEAR FROM date) = year;
  
  -- Delete expenses for the specified month and year
  DELETE FROM public.expenses 
  WHERE EXTRACT(MONTH FROM date) = month 
  AND EXTRACT(YEAR FROM date) = year;
  
  -- Reset all member balances to zero
  UPDATE public.members SET balance = 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  RETURN NEW;
END;
$function$;