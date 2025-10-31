-- Update RLS policies to filter by user_id

-- Members table policies
DROP POLICY IF EXISTS "Users can view members" ON public.members;
DROP POLICY IF EXISTS "Users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update their members" ON public.members;

CREATE POLICY "Users can view their own members"
ON public.members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own members"
ON public.members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own members"
ON public.members FOR UPDATE
USING (auth.uid() = user_id);

-- Meal entries policies
DROP POLICY IF EXISTS "Users can view meal entries" ON public.meal_entries;
DROP POLICY IF EXISTS "Users can insert meal entries" ON public.meal_entries;
DROP POLICY IF EXISTS "Users can update their meal entries" ON public.meal_entries;

CREATE POLICY "Users can view their own meal entries"
ON public.meal_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal entries"
ON public.meal_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal entries"
ON public.meal_entries FOR UPDATE
USING (auth.uid() = user_id);

-- Expenses policies
DROP POLICY IF EXISTS "Users can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their expenses" ON public.expenses;

CREATE POLICY "Users can view their own expenses"
ON public.expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
ON public.expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
ON public.expenses FOR UPDATE
USING (auth.uid() = user_id);

-- Make sure user_id is NOT nullable on members table
ALTER TABLE public.members ALTER COLUMN user_id SET NOT NULL;