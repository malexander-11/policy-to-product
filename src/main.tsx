import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { RepairsProvider } from './state/RepairsContext'
import { ToastProvider } from './components/Toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RepairsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </RepairsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
