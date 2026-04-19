// =====================================================
// UNIVERSUS — Supabase Configuration & Auth Module
// =====================================================

const SUPABASE_URL = 'https://otxvqphwtuldkrglfwxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHZxcGh3dHVsZGtyZ2xmd3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTk4OTgsImV4cCI6MjA4ODY3NTg5OH0.jRyaHr3k96dm5-486S-EXvNespBl9Iwh2bIupM1YnVU';

// Inicializar o cliente Supabase
let supabase;
try {
  const sb = window.supabase;
  if (sb && sb.createClient) {
    supabase = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase inicializado com sucesso');
  } else {
    console.error('Supabase SDK nao carregou. window.supabase =', typeof window.supabase);
  }
} catch (e) {
  console.error('Erro ao inicializar Supabase:', e);
}

// ===== AUTH HELPERS =====

/**
 * Registrar novo usuário
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @param {string} role - 'professor' ou 'aluno'
 * @returns {Promise<{user, error}>}
 */
async function signUp(email, password, name, role) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role }
    }
  });
  return { user: data?.user, session: data?.session, error };
}

/**
 * Login do usuário
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user, session, error}>}
 */
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { user: data?.user, session: data?.session, error };
}

/**
 * Logout
 */
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = 'tela-login.html';
  }
  return { error };
}

/**
 * Obter usuário logado atual
 * @returns {Promise<{user, profile}>}
 */
async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, profile: null };

  // Buscar perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
}

/**
 * Obter sessão atual
 */
async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Guardar página - redireciona para login se não autenticado
 * @param {string|null} requiredRole - 'professor', 'aluno' ou null (qualquer role)
 * @returns {Promise<{user, profile}>}
 */
async function requireAuth(requiredRole = null) {
  const { user, profile } = await getUser();

  if (!user || !profile) {
    window.location.href = 'tela-login.html';
    return { user: null, profile: null };
  }

  if (requiredRole && profile.role !== requiredRole) {
    // Redirecionar para página correta baseado no role
    if (profile.role === 'professor') {
      window.location.href = 'pagina-inicial.html';
    } else {
      window.location.href = 'pagina-inicial-aluno.html';
    }
    return { user: null, profile: null };
  }

  return { user, profile };
}

/**
 * Redirecionar para a página inicial correta baseado no role
 * @param {string} role
 */
function redirectToDashboard(role) {
  if (role === 'professor') {
    window.location.href = 'pagina-inicial.html';
  } else {
    window.location.href = 'pagina-inicial-aluno.html';
  }
}

// ===== QUIZ HELPERS =====

/**
 * Gerar código de acesso único para quiz
 * @returns {string} código de 6 caracteres
 */
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Criar quiz completo (quiz + perguntas)
 */
async function createQuiz(quizData, questionsData) {
  const { user } = await getUser();
  if (!user) return { error: { message: 'Não autenticado' } };

  // Gerar código único
  let accessCode = generateAccessCode();

  // Inserir quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      creator_id: user.id,
      title: quizData.title,
      description: quizData.description || '',
      category: quizData.category,
      difficulty: quizData.difficulty,
      time_per_question: quizData.timePerQuestion || 30,
      access_code: accessCode,
      is_active: false
    })
    .select()
    .single();

  if (quizError) return { error: quizError };

  // Inserir perguntas
  const questionsToInsert = questionsData.map((q, i) => ({
    quiz_id: quiz.id,
    question_text: q.question,
    options: q.options,
    correct_index: q.correctIndex,
    order_num: i + 1
  }));

  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert);

  if (questionsError) return { error: questionsError };

  return { quiz, accessCode, error: null };
}

/**
 * Buscar quizzes do professor logado
 */
async function getMyQuizzes() {
  const { user } = await getUser();
  if (!user) return { data: [], error: { message: 'Não autenticado' } };

  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(count)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Buscar todos os quizzes ativos (para alunos)
 */
async function getActiveQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(count)')
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Buscar quiz por código de acesso
 */
async function getQuizByCode(code) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(count)')
    .eq('access_code', code.toUpperCase())
    .single();

  return { data, error };
}

/**
 * Buscar perguntas de um quiz
 */
async function getQuizQuestions(quizId) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_num', { ascending: true });

  return { data: data || [], error };
}

/**
 * Deletar um quiz
 */
async function deleteQuiz(quizId) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId);

  return { error };
}

/**
 * Ativar/desativar quiz
 */
async function toggleQuizActive(quizId, isActive) {
  const { error } = await supabase
    .from('quizzes')
    .update({ is_active: isActive })
    .eq('id', quizId);

  return { error };
}

/**
 * Registrar tentativa de quiz do aluno
 */
async function submitQuizAttempt(quizId, answers, score, totalQuestions, correctAnswers) {
  const { user } = await getUser();
  if (!user) return { error: { message: 'Não autenticado' } };

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      student_id: user.id,
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      answers
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Buscar tentativas do aluno logado
 */
async function getMyAttempts() {
  const { user } = await getUser();
  if (!user) return { data: [], error: { message: 'Não autenticado' } };

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes(title, category)')
    .eq('student_id', user.id)
    .order('completed_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Buscar tentativas dos quizzes do professor
 */
async function getAttemptsForMyQuizzes() {
  const { user } = await getUser();
  if (!user) return { data: [], error: { message: 'Não autenticado' } };

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes!inner(title, category, creator_id), profiles!quiz_attempts_student_id_fkey(name)')
    .eq('quizzes.creator_id', user.id)
    .order('completed_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Salvar configuração do avatar no perfil
 */
async function saveAvatarConfig(avatarConfig) {
  const { user } = await getUser();
  if (!user) return { error: { message: 'Não autenticado' } };

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_config: avatarConfig })
    .eq('id', user.id);

  return { error };
}

// ===== SESSION HELPERS (Sala de espera) =====

/**
 * Entrar na sala de espera de um quiz
 */
async function joinQuizSession(quizId, studentName) {
  const { user } = await getUser();

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({
      quiz_id: quizId,
      student_id: user?.id || null,
      student_name: studentName,
      status: 'waiting'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Sair da sala de espera
 */
async function leaveQuizSession(sessionId) {
  const { error } = await supabase
    .from('quiz_sessions')
    .delete()
    .eq('id', sessionId);

  return { error };
}

/**
 * Buscar jogadores na sala de espera de um quiz
 */
async function getSessionPlayers(quizId) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Escutar mudanças em tempo real na sala de espera
 */
function subscribeToSession(quizId, callback) {
  return supabase
    .channel(`quiz_session_${quizId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'quiz_sessions', filter: `quiz_id=eq.${quizId}` },
      (payload) => callback(payload)
    )
    .subscribe();
}

/**
 * Cancelar assinatura de sala de espera
 */
function unsubscribeFromSession(channel) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}
