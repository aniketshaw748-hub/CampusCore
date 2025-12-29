-- Create enums for roles and urgency levels
CREATE TYPE public.app_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.content_type AS ENUM ('notice', 'syllabus', 'study_material', 'assignment');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  branch TEXT,
  semester INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create faculty_uploads table (notices, syllabus, materials)
CREATE TABLE public.faculty_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL,
  file_url TEXT,
  file_name TEXT,
  branch_id UUID REFERENCES public.branches(id),
  semester INTEGER,
  subject_id UUID REFERENCES public.subjects(id),
  urgency urgency_level DEFAULT 'low',
  deadline TIMESTAMP WITH TIME ZONE,
  is_exam_related BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create student_uploads table (personal notes)
CREATE TABLE public.student_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  exam_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create chat_messages table for CampusGPT
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  source_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create exam_attempts table
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id),
  subject_id UUID REFERENCES public.subjects(id),
  score INTEGER,
  total_questions INTEGER,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role once" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Branches policies (public read)
CREATE POLICY "Anyone can view branches" ON public.branches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage branches" ON public.branches
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subjects policies (public read)
CREATE POLICY "Anyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Faculty uploads policies
CREATE POLICY "Anyone authenticated can view faculty uploads" ON public.faculty_uploads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Faculty and admins can insert uploads" ON public.faculty_uploads
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Faculty can update their own uploads" ON public.faculty_uploads
  FOR UPDATE TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Faculty can delete their own uploads" ON public.faculty_uploads
  FOR DELETE TO authenticated
  USING (auth.uid() = uploaded_by);

-- Student uploads policies (private to student)
CREATE POLICY "Students can view their own uploads" ON public.student_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own uploads" ON public.student_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete their own uploads" ON public.student_uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Exams policies
CREATE POLICY "Anyone authenticated can view exams" ON public.exams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Faculty and admins can manage exams" ON public.exams
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin'));

-- Chat messages policies
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exam attempts policies
CREATE POLICY "Users can view their own exam attempts" ON public.exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam attempts" ON public.exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faculty_uploads_updated_at
  BEFORE UPDATE ON public.faculty_uploads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial branch data
INSERT INTO public.branches (name, code) VALUES
  ('Computer Science', 'CS'),
  ('Electronics & Communication', 'ECE'),
  ('Mechanical Engineering', 'ME'),
  ('Civil Engineering', 'CE'),
  ('Electrical Engineering', 'EE'),
  ('Information Technology', 'IT');

-- Insert initial subjects
INSERT INTO public.subjects (name, code, branch_id, semester)
SELECT 'Data Structures', 'CS201', id, 3 FROM public.branches WHERE code = 'CS';
INSERT INTO public.subjects (name, code, branch_id, semester)
SELECT 'Algorithms', 'CS301', id, 4 FROM public.branches WHERE code = 'CS';
INSERT INTO public.subjects (name, code, branch_id, semester)
SELECT 'Database Systems', 'CS302', id, 4 FROM public.branches WHERE code = 'CS';
INSERT INTO public.subjects (name, code, branch_id, semester)
SELECT 'Operating Systems', 'CS303', id, 5 FROM public.branches WHERE code = 'CS';
INSERT INTO public.subjects (name, code, branch_id, semester)
SELECT 'Computer Networks', 'CS401', id, 6 FROM public.branches WHERE code = 'CS';
INSERT INTO public.subjects (name, code, branch_id, semester)
SELECT 'Digital Electronics', 'ECE201', id, 3 FROM public.branches WHERE code = 'ECE';
INSERT INTO public.subjects (name, code, branch_id, semester)
SELECT 'Signal Processing', 'ECE301', id, 4 FROM public.branches WHERE code = 'ECE';