import type { ContentType, UrgencyLevel } from "@/types";

export interface LocalFacultyUpload {
  id: string;
  title: string;
  description: string | null;
  content_type: ContentType;
  file_name: string | null;
  created_at: string;
  urgency: UrgencyLevel;
}

const key = (userId: string) => `faculty_uploads_${userId}`;

export const loadFacultyUploads = (userId: string): LocalFacultyUpload[] => {
  try {
    const raw = localStorage.getItem(key(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveFacultyUploads = (
  userId: string,
  uploads: LocalFacultyUpload[]
) => {
  localStorage.setItem(key(userId), JSON.stringify(uploads));
};
