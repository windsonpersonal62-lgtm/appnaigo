import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// globals.css PRIMEIRO: ele declara a ordem das camadas (@layer) antes de qualquer outro CSS.
import './styles/globals.css'
import { App } from './App'

// Libera os ícones só quando a fonte local carregou (ver globals.css). Sem fonte, ficam invisíveis
// em vez de mostrar o nome por extenso.
void document.fonts
  ?.load('24px "Material Symbols Outlined"', 'home')
  .then((faces) => {
    if (faces.length > 0) document.documentElement.classList.add('icons-ready')
  })
  .catch(() => {})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Elemento #root não encontrado em index.html.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
