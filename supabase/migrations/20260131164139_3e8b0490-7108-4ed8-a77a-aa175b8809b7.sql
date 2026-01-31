-- Create deposits table to track deposits per member per month
CREATE TABLE public.deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own deposits" 
ON public.deposits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deposits" 
ON public.deposits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deposits" 
ON public.deposits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deposits" 
ON public.deposits FOR DELETE 
USING (auth.uid() = user_id);