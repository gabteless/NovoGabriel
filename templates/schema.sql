-- =====================================================
-- UNIVERSUS — Schema do Banco de Dados (Supabase)
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Tabela de perfis (extensão do auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('professor', 'aluno')),
  avatar_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Facil', 'Medio', 'Dificil')),
  time_per_question INTEGER DEFAULT 30,
  access_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de perguntas
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_index INTEGER NOT NULL DEFAULT 0,
  order_num INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'Facil' CHECK (difficulty IN ('Facil', 'Medio', 'Dificil')),
  time_limit INTEGER NOT NULL DEFAULT 30
);

-- 4. Tabela de tentativas/resultados
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de sessões (sala de espera)
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished'))
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- PROFILES: usuário pode ver e editar próprio perfil
CREATE POLICY "Usuarios podem ver proprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar proprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuarios podem inserir proprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- QUIZZES: professor pode CRUD próprios, todos podem ler ativos
CREATE POLICY "Professores podem criar quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Professores podem atualizar proprios quizzes"
  ON quizzes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Professores podem deletar proprios quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = creator_id);

CREATE POLICY "Todos podem ver quizzes"
  ON quizzes FOR SELECT
  USING (true);

-- QUESTIONS: professor pode CRUD, alunos podem ler de quizzes ativos
CREATE POLICY "Professores podem gerenciar perguntas"
  ON questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Todos podem ver perguntas"
  ON questions FOR SELECT
  USING (true);

-- QUIZ_ATTEMPTS: alunos podem inserir próprias tentativas, professores podem ver de seus quizzes
CREATE POLICY "Alunos podem registrar tentativas"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Usuarios podem ver proprias tentativas"
  ON quiz_attempts FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM quizzes WHERE quizzes.id = quiz_attempts.quiz_id AND quizzes.creator_id = auth.uid()
    )
  );

-- QUIZ_SESSIONS: todos podem ler e inserir (para sala de espera)
CREATE POLICY "Todos podem ver sessoes"
  ON quiz_sessions FOR SELECT
  USING (true);

CREATE POLICY "Usuarios podem entrar em sessoes"
  ON quiz_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuarios podem sair de sessoes"
  ON quiz_sessions FOR DELETE
  USING (auth.uid() = student_id);

-- =====================================================
-- TRIGGER: criar perfil automaticamente ao registrar
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuario'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'aluno')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger se já existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
