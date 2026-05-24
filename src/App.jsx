import Auth from './pages/auth'

function App() {
  // Se a URL contém um path de arquivo HTML das templates, não renderiza o React
  const path = window.location.pathname
  if (path.includes('.html')) {
    window.location.replace(path)
    return null
  }

  return <Auth />
}

export default App
