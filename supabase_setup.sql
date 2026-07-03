-- 0. Extensão UUID para gerar chaves primárias (se necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Courses (Cursos)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    hours INTEGER,
    lessons INTEGER,
    disciplines_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Course Modules (Módulos dos Cursos)
CREATE TABLE IF NOT EXISTS public.course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lessons_count INTEGER,
    pdfs_count INTEGER,
    questions_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Questions (Questões)
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    banca TEXT,
    year INTEGER,
    discipline TEXT,
    subject TEXT,
    text TEXT NOT NULL,
    alternatives JSONB NOT NULL,
    correct TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Law Articles (Leis Inteligentes)
CREATE TABLE IF NOT EXISTS public.law_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    citation TEXT,
    content TEXT,
    related_questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Badges (Conquistas)
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Mock Simulators (Simulados)
CREATE TABLE IF NOT EXISTS public.mock_simulators (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    questions_count INTEGER,
    duration TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. User Progress (Perfis, Progresso, Notas)
-- Perfil do usuário (pode referenciar auth.users no futuro usando UUID em vez de TEXT, mas usaremos UUID aqui para seguir o padrão do Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY, -- Esta seria a mesma chave primária da tabela auth.users gerada pelo Supabase Auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Conquistas Desbloqueadas pelo Usuário
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Tabela de Histórico de Simulados (Notas)
CREATE TABLE IF NOT EXISTS public.user_simulator_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    simulator_id TEXT REFERENCES public.mock_simulators(id) ON DELETE CASCADE,
    grade NUMERIC,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progresso de Módulos (Aulas assistidas / % completo)
CREATE TABLE IF NOT EXISTS public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    module_id TEXT REFERENCES public.course_modules(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- 8. Configurar RLS (Row Level Security) Básico para leitura
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_simulators ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura (todo mundo pode ver cursos, questões, simulados, etc)
CREATE POLICY "Leitura publica de courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Leitura publica de course_modules" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "Leitura publica de questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Leitura publica de law_articles" ON public.law_articles FOR SELECT USING (true);
CREATE POLICY "Leitura publica de badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Leitura publica de mock_simulators" ON public.mock_simulators FOR SELECT USING (true);
