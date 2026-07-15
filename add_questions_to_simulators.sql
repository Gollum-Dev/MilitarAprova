-- Execute este comando SQL no console do Supabase (SQL Editor) para preparar a tabela de simulados:

-- 1. Adicionar a coluna de questões à tabela de simulados se ela ainda não existir
ALTER TABLE public.mock_simulators 
ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;

-- 2. Adicionar políticas de segurança RLS para permitir cadastro, edição e exclusão de simulados
DROP POLICY IF EXISTS "Insercao publica de mock_simulators" ON public.mock_simulators;
DROP POLICY IF EXISTS "Atualizacao publica de mock_simulators" ON public.mock_simulators;
DROP POLICY IF EXISTS "Exclusao publica de mock_simulators" ON public.mock_simulators;

CREATE POLICY "Insercao publica de mock_simulators" ON public.mock_simulators FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualizacao publica de mock_simulators" ON public.mock_simulators FOR UPDATE USING (true);
CREATE POLICY "Exclusao publica de mock_simulators" ON public.mock_simulators FOR DELETE USING (true);
