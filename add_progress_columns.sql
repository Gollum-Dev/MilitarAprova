-- Execute este comando SQL no console do Supabase para adicionar as colunas de progresso na tabela 'students'
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS resource_statuses JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS completed_resources JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completed_dates JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS study_hours NUMERIC DEFAULT 12.5,
ADD COLUMN IF NOT EXISTS questions_answered INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS questions_correct INTEGER DEFAULT 14;
