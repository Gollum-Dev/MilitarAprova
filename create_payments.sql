-- 1. Adiciona coluna de preço na tabela de cursos se não existir
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 297.00;

-- Atualiza preços padrão dos cursos existentes
UPDATE public.courses SET price = 497.00 WHERE id = 'cho-cbmmg-2027';
UPDATE public.courses SET price = 597.00 WHERE id = 'cfo-cbmmg-2027';
UPDATE public.courses SET price = 297.00 WHERE id = 'eap-cbmmg-2026';

-- 2. Cria tabela de pagamentos para Mercado Pago
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_email TEXT NOT NULL,
    course_id TEXT NOT NULL REFERENCES public.courses(id),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
    amount NUMERIC(10, 2) NOT NULL,
    preference_id TEXT UNIQUE,
    payment_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilita RLS para a tabela de pagamentos para permitir a inserção do backend/anon
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Força o reload do esquema do Supabase
NOTIFY pgrst, 'reload schema';
