CREATE TABLE IF NOT EXISTS public.materias (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    discipline TEXT,
    area TEXT,
    resources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.materias DISABLE ROW LEVEL SECURITY;

-- Se a tabela já existir, adicione as colunas com estes comandos:
ALTER TABLE public.materias ADD COLUMN IF NOT EXISTS discipline TEXT;
ALTER TABLE public.materias ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.materias ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.global_disciplines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.global_disciplines DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.global_areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    discipline_id TEXT NOT NULL REFERENCES public.global_disciplines(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.global_areas DISABLE ROW LEVEL SECURITY;
