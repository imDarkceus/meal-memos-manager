-- Add DELETE policy for members table
CREATE POLICY "Users can delete their own members" 
ON public.members 
FOR DELETE 
USING (auth.uid() = user_id);