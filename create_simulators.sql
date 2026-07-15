CREATE TABLE IF NOT EXISTS public.mock_simulators (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    status TEXT DEFAULT 'aberto',
    course_ids JSONB DEFAULT '[]'::jsonb,
    questions_count INTEGER DEFAULT 0,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mock_simulators DISABLE ROW LEVEL SECURITY;

-- If table exists, add columns to prevent errors
ALTER TABLE public.mock_simulators ADD COLUMN IF NOT EXISTS course_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.mock_simulators ADD COLUMN IF NOT EXISTS questions_count INTEGER DEFAULT 0;
ALTER TABLE public.mock_simulators ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;
