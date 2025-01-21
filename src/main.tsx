import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Chatbot from './Chatbot.tsx'

createRoot(document.getElementById('arivubot')!).render(
  <StrictMode>
    <Chatbot />
  </StrictMode>,
)
