import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import './theme/tema-escuro.css'
import './animations/animations.css'
import AutoAnimador from './animations/AutoAnimador.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <AutoAnimador />
  </StrictMode>,
)
