import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// As páginas em templates/ são HTML estático servido como está (sem bundler):
// usam o SDK do Supabase via CDN e supabase-config.js por caminho relativo.
// Copiamos a pasta inteira verbatim para dist/templates/ para que `npm run build`
// (e portanto `npm run deploy`) gere o MESMO site que já está no ar servido a
// partir do branch main — sem o risco de o Vite reescrever os scripts inline.
function copyTemplates() {
  return {
    name: 'copy-templates',
    apply: 'build',
    closeBundle() {
      cpSync(
        resolve(__dirname, 'templates'),
        resolve(__dirname, 'dist/templates'),
        { recursive: true }
      )
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: funcionam tanto em /NovoGabriel/ (GitHub Pages)
  // quanto ao abrir os arquivos localmente, sem depender do nome do repo.
  base: './',
  plugins: [react(), copyTemplates()],
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['.']
    }
  },
  appType: 'mpa' // Multi-Page Application: não intercepta rotas .html
})
