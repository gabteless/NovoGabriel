<p align="center">
  <img src="https://img.shields.io/badge/UNIVERSUS-Quiz%20Platform-7c3aed?style=for-the-badge&labelColor=090a0f" alt="UNIVERSUS">
</p>

<h1 align="center">🌌 UNIVERSUS</h1>

<p align="center">
  <b>Plataforma interativa de quizzes para professores e alunos</b><br>
  <sub>Crie, compartilhe e jogue quizzes em tempo real com uma interface espacial imersiva</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js">
</p>

---

## 📖 Sobre o Projeto

**UNIVERSUS** é uma plataforma web gamificada de quizzes voltada para o ambiente educacional. Professores criam e gerenciam quizzes com código de acesso, enquanto alunos entram usando apenas um apelido — sem necessidade de criar conta.

O design é inspirado no universo espacial, com estrelas animadas, nebulosas e efeitos de glassmorphism, proporcionando uma experiência visual imersiva.

---

## ✨ Funcionalidades

### 👨‍🏫 Professor
- **Autenticação completa** — Registro e login via email/senha (Supabase Auth)
- **Criar quizzes** — Editor passo-a-passo com título, categoria, dificuldade e tempo por questão
- **Gerenciar quizzes** — Visualizar, ativar/desativar e deletar quizzes criados
- **Código de acesso** — Geração automática de código de 6 caracteres + QR Code para compartilhar
- **Relatórios** — Dashboard com estatísticas de quizzes criados, vezes jogados e taxa de acerto
- **Personalização** — Editor de avatar 3D com customização de rosto, cabelo, olhos, nariz, boca e roupa

### 🎓 Aluno
- **Entrada simplificada** — Apenas apelido, sem necessidade de email ou senha
- **Jogar quizzes** — Inserir código de acesso do professor para entrar no quiz
- **Sala de espera** — Sistema de lobby em tempo real antes do quiz começar
- **Gameplay interativo** — Temporizador, feedback visual de acerto/erro e progresso
- **Resultados detalhados** — Tela de resultado com pontuação e revisão das respostas
- **Avatar 3D** — Mesmo editor de personagem disponível para alunos

---

## 🏗️ Arquitetura do Projeto

```
trabalho/
├── index.html                          # Roteador inteligente (redireciona baseado na sessão)
└── NovoGabriel/
    └── templates/
        ├── tela-login.html             # Tela de login/registro (Professor + Aluno)
        ├── pagina-inicial.html         # Dashboard do Professor
        ├── pagina-inicial-aluno.html   # Dashboard do Aluno
        ├── criar-quiz.html             # Editor de criação de quiz (4 etapas)
        ├── entrar-quiz.html            # Entrada no quiz via código/QR
        ├── pagina-delete.html          # Gerenciamento e exclusão de quizzes
        ├── calculadora.html            # Calculadora auxiliar
        ├── criar-conta.html            # Criação de conta (alternativo)
        ├── supabase-config.js          # Configuração do Supabase e módulos de Auth/API
        ├── schema.sql                  # Schema do banco de dados (SQL)
        └── test-mini.html              # Página de testes
```

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5 + CSS3** | Estrutura e estilização com glassmorphism e animações |
| **JavaScript (Vanilla)** | Lógica da aplicação, interatividade e comunicação com API |
| **Supabase** | Backend-as-a-Service: autenticação, banco de dados PostgreSQL e realtime |
| **Three.js** | Renderização 3D do editor de avatar/personagem |
| **Canvas API** | Animação de estrelas e efeitos visuais de fundo |

---

## 🗄️ Banco de Dados

O projeto utiliza **Supabase** (PostgreSQL) com as seguintes tabelas:

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis de usuários (extensão do `auth.users`) |
| `quizzes` | Quizzes criados pelos professores |
| `questions` | Perguntas de cada quiz |
| `quiz_attempts` | Tentativas/resultados dos alunos |
| `quiz_sessions` | Sessões da sala de espera (tempo real) |

O schema completo com **Row Level Security (RLS)** e triggers está em [`schema.sql`](NovoGabriel/templates/schema.sql).

---

## 🚀 Como Executar

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge)
- Conta no [Supabase](https://supabase.com) (para o backend)

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/universus.git
cd universus
```

### 2. Configurar o Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o conteúdo de `NovoGabriel/templates/schema.sql` no **SQL Editor** do Supabase
3. Atualize as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` em:
   - `NovoGabriel/templates/supabase-config.js`
   - `index.html`

### 3. Iniciar servidor local
```bash
npx http-server . -p 8080 -c-1
```

### 4. Acessar no navegador
```
http://localhost:8080
```

> O `index.html` verifica automaticamente se há uma sessão ativa e redireciona:
> - **Professor logado** → Dashboard do Professor
> - **Aluno logado** (apelido salvo) → Dashboard do Aluno
> - **Ninguém logado** → Tela de Login

---

## 🎮 Como Usar

### Professor
1. Acesse o site e clique em **Professor**
2. Crie uma conta com email e senha
3. No dashboard, clique em **Criar Quiz**
4. Preencha os detalhes, adicione perguntas e gere o código de acesso
5. Compartilhe o código com seus alunos

### Aluno
1. Acesse o site e clique em **Aluno**
2. Escolha um apelido
3. No dashboard, clique em **Procurar Quiz**
4. Insira o código fornecido pelo professor
5. Responda as perguntas e veja seu resultado!

---

## 🎨 Design

O projeto possui uma identidade visual espacial com:

- 🌟 **Estrelas animadas** — Múltiplas camadas de canvas com efeito de brilho
- 🌌 **Nebulosas** — Gradientes com blur para criar profundidade
- 💎 **Glassmorphism** — Cards com backdrop-filter e bordas translúcidas
- ✨ **Gradientes animados** — Título com animação de cores
- 🧑‍🚀 **Avatar 3D** — Editor de personagem completo com Three.js
- 📱 **Responsivo** — Layout adaptável para desktop e mobile

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

---

<p align="center">
  Feito com 💜 por <b>Gabriel</b>
</p>
