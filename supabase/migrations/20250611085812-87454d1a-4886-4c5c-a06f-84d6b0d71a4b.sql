
-- Create CAD integrations table
CREATE TABLE public.cad_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_type TEXT NOT NULL,
  name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cad_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for CAD integrations
CREATE POLICY "Users can view their own CAD integrations" 
  ON public.cad_integrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CAD integrations" 
  ON public.cad_integrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CAD integrations" 
  ON public.cad_integrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CAD integrations" 
  ON public.cad_integrations 
  FOR DELETE 
  USING (auth.uid() = user_id);
