-- Add DELETE policy for meal_entries table
CREATE POLICY "Users can delete their own meal entries" 
ON public.meal_entries 
FOR DELETE 
USING (auth.uid() = user_id);