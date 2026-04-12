import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'

// Wait for Wails runtime to be ready
window.addEventListener('wailsruntimeready', () => {
  const container = document.getElementById('root')
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <App/>
    </React.StrictMode>
  )
})

// Fallback if event doesn't fire
setTimeout(() => {
  if (!document.getElementById('root').innerHTML) {
    const container = document.getElementById('root')
    const root = createRoot(container)
    root.render(
      <React.StrictMode>
        <App/>
      </React.StrictMode>
    )
  }
}, 1000)
