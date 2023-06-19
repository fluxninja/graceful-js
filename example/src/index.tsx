import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'

const container = document.getElementById('root')
const root = createRoot(container as HTMLElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
