
-- Make uploaded_by nullable for demo data
ALTER TABLE public.faculty_uploads ALTER COLUMN uploaded_by DROP NOT NULL;

-- Also allow faculty_uploads without foreign key constraint for demo
ALTER TABLE public.faculty_uploads DROP CONSTRAINT IF EXISTS faculty_uploads_uploaded_by_fkey;
