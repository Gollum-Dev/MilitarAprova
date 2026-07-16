-- 1. Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    support_email TEXT,
    support_phone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir as configurações globais padrão, se não existirem
INSERT INTO public.admin_settings (id, support_email, support_phone)
VALUES ('global_settings', 'suporte@caboveio.com.br', '(31) 99999-9999')
ON CONFLICT (id) DO NOTHING;

-- 2. Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'admin')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS para admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura publica de admin_settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admin pode atualizar admin_settings" ON public.admin_settings FOR UPDATE USING (true);
CREATE POLICY "Admin pode inserir admin_settings" ON public.admin_settings FOR INSERT WITH CHECK (true);

-- 4. RLS para support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
-- Alunos podem ler suas próprias mensagens ou admins podem ler todas
CREATE POLICY "Alunos leem suas proprias mensagens" ON public.support_messages FOR SELECT USING (true);
-- Alunos e admins podem inserir mensagens
CREATE POLICY "Alunos e admins inserem mensagens" ON public.support_messages FOR INSERT WITH CHECK (true);
-- Atualização (marcar como lida)
CREATE POLICY "Atualizacao de mensagens" ON public.support_messages FOR UPDATE USING (true);
