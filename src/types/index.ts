export type AppRole = 'student' | 'faculty' | 'admin';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type ContentType = 'notice' | 'syllabus' | 'study_material' | 'assignment';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  branch: string | null;
  semester: number | null;
  department?: string;
  teaching_subjects?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  branch_id: string;
  semester: number;
  created_at: string;
}

export interface FacultyUpload {
  id: string;
  uploaded_by: string;
  title: string;
  description: string | null;
  content_type: ContentType;
  file_url: string | null;
  file_name: string | null;
  branch_id: string | null;
  semester: number | null;
  subject_id: string | null;
  urgency: UrgencyLevel;
  deadline: string | null;
  is_exam_related: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentUpload {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  subject_id: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  source_label: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  name: string;
  subject_id: string | null;
  exam_date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string | null;
  subject_id: string | null;
  score: number | null;
  total_questions: number | null;
  time_taken_seconds: number | null;
  completed_at: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'mcq' | 'short_answer';
}
