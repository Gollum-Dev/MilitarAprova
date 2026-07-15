-- Adiciona as colunas necessárias para salvar o progresso do aluno no banco de dados
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS study_hours NUMERIC DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS questions_answered INTEGER DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS questions_correct INTEGER DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS completed_resources JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS completed_dates JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS resource_statuses JSONB DEFAULT '{}'::jsonb;

-- Atualiza a memória/cache da API do Supabase imediatamente para ele reconhecer as colunas
NOTIFY pgrst, 'reload schema';
