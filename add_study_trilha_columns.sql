-- Execute este comando SQL no console do Supabase para adicionar as colunas da Trilha Inteligente na tabela 'students'
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS study_mode VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_blocks_available JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS current_cycle_position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_proficiency JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS trilha_tasks JSONB DEFAULT '[]'::jsonb;
