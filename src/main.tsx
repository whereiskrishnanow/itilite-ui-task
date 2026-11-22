import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Inter with the optical-size axis; styles.css pins opsz to 32, which is the Inter Display cut.
import '@fontsource-variable/inter/opsz.css'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
