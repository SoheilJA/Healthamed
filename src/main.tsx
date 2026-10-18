import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/vazirmatn'
import '@/index.css'
import App from './App'

// Seed the mock database before first render (one-time, deterministic).
import { getDB } from '@/services/db'

try {
  getDB()
} catch (e) {
  console.error('[healthamed] database init failed', e)
}

// Remove the first-paint splash
const splash = document.getElementById('splash')
if (splash) {
  splash.classList.add('hide')
  setTimeout(() => splash.remove(), 350)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
