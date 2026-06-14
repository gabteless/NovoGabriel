# UNIVERSUS — CLAUDE.md

## Visão geral do projeto

UNIVERSUS é uma plataforma de quiz gamificada para professores e alunos. O front-end é composto por páginas HTML estáticas em `templates/` que se comunicam diretamente com o Supabase via SDK no navegador.

## Estrutura de arquivos

```
templates/
  tela-login.html          — Tela de entrada: escolha entre Professor (Google OAuth) e Aluno (apelido)
  criar-conta.html         — Cadastro de nova conta (professor ou aluno) com email/senha
  pagina-inicial.html      — Dashboard do professor: buscar quiz, relatórios, criar quiz, avatar
  pagina-inicial-aluno.html— Dashboard do aluno: entrar em quiz, ver resultados
  criar-quiz.html          — Editor de quiz para professores
  entrar-quiz.html         — Tela do aluno para entrar em uma sessão de quiz ao vivo
  pagina-delete.html       — Gerenciar/excluir quizzes
  calculadora.html         — Calculadora auxiliar
  supabase-config.js       — Inicialização do cliente Supabase e funções auxiliares (signUp, signIn, OAuth)
  schema.sql               — Schema do banco de dados Supabase

src/
  pages/auth.jsx           — Componente React de autenticação (não usado nas páginas HTML estáticas)
  api/supabaseClient.js    — Cliente Supabase para o lado React

index.html                 — Entry point Vite/React (separado das páginas estáticas)
vite.config.js             — Configuração do Vite
```

## Autenticação

- **Professor (login)**: duas formas em `tela-login.html`:
  1. **Email/senha** — formulário com `signIn(email, password)`, redireciona via `redirectToDashboard(role)`.
  2. **Google OAuth** — `_sb.auth.signInWithOAuth({ provider: 'google' })`, redireciona para `pagina-inicial.html` via callback.
- **Aluno (login rápido)**: apenas apelido salvo em `localStorage` (`uv_student_nickname`), sem autenticação real. Redireciona para `pagina-inicial-aluno.html`.
- **Criar conta — email/senha**: formulário com nome, email, senha, confirmação e tipo de conta (professor ou aluno). Usa `supabase-config.js → signUp()`. Após cadastro, redireciona para `tela-login.html`.
- **Criar conta — Google OAuth**: botão "Continuar com Google" em `criar-conta.html`, usa o mesmo `signInWithOAuth`. Após OAuth callback, redireciona para `pagina-inicial.html` (conta Google = professor). Ambas as formas coexistem na mesma página.

## Fluxo de navegação

```
tela-login.html
  ├── Professor → loginCard (Google) → pagina-inicial.html
  ├── Aluno     → studentCard (apelido) → pagina-inicial-aluno.html
  └── Criar nova conta → criar-conta.html → (após cadastro) → tela-login.html
```

## Estilo e design

- Tema espacial: fundo `radial-gradient(ellipse at bottom, #1b2735, #090a0f)`, estrelas animadas em `<canvas>`, nebulosas com `blur`.
- Paleta principal: roxo `#7c3aed / #a78bfa`, azul `#3b82f6 / #60a5fa`, rosa `#f472b6`.
- Cards: `backdrop-filter: blur(20px)`, borda `rgba(255,255,255,0.1)`, fundo `rgba(255,255,255,0.05)`.
- Todos os inputs e botões seguem o mesmo padrão de glassmorphism definido em cada página.

## Supabase

- Configuração em `supabase-config.js` (URL e chave pública lidas do `.env` via Vite, ou hardcoded para as páginas estáticas).
- Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- O schema completo do banco está em `templates/schema.sql`.

## Como rodar

```bash
cd C:\Users\luism\PROJ-INT\NovoGabriel
npm run dev
```

As páginas HTML em `templates/` podem ser abertas diretamente no navegador ou servidas pelo Vite.
