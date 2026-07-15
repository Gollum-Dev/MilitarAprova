ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
NOTIFY pgrst, 'reload schema';
