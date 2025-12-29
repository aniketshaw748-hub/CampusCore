-- Create student_memories table for persistent memory storage
CREATE TABLE public.student_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'weakness', 'goal', 'behavior', 'context')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_instructions table
CREATE TABLE public.custom_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  response_style TEXT,
  about_me TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tone_history table for emotional intelligence tracking
CREATE TABLE public.tone_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('confused', 'frustrated', 'neutral', 'confident')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.student_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tone_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_memories
CREATE POLICY "Users can view their own memories" 
ON public.student_memories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" 
ON public.student_memories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" 
ON public.student_memories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
ON public.student_memories FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for custom_instructions
CREATE POLICY "Users can view their own instructions" 
ON public.custom_instructions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instructions" 
ON public.custom_instructions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instructions" 
ON public.custom_instructions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instructions" 
ON public.custom_instructions FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for tone_history
CREATE POLICY "Users can view their own tone history" 
ON public.tone_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tone history" 
ON public.tone_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tone history" 
ON public.tone_history FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_student_memories_user_id ON public.student_memories(user_id);
CREATE INDEX idx_tone_history_user_id ON public.tone_history(user_id);
CREATE INDEX idx_tone_history_created_at ON public.tone_history(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_student_memories_updated_at
BEFORE UPDATE ON public.student_memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_instructions_updated_at
BEFORE UPDATE ON public.custom_instructions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();