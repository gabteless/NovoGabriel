import { useState } from 'react'
import { supabase } from '../api/supabaseClient'

function Auth() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [modoLogin, setModoLogin] = useState(true)

  async function handleAuth(e) {
    e.preventDefault()

    if (modoLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      })

      if (error) {
        alert(error.message)
      } else {
        alert('Login realizado!')
      }

    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha
      })

      if (error) {
        alert(error.message)
      } else {
        alert('Conta criada!')
      }
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) alert(error.message)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{modoLogin ? 'Login' : 'Cadastro'}</h2>

      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setSenha(e.target.value)}
        />
        <br /><br />

        <button type="submit">
          {modoLogin ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      <br />

      <button onClick={handleGoogle}>
        Entrar com Google
      </button>

      <br /><br />

      <button onClick={() => setModoLogin(!modoLogin)}>
        {modoLogin ? 'Criar conta' : 'Já tenho conta'}
      </button>
    </div>
  )
}

export default Auth
