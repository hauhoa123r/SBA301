import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './app/provider/AuthProvider';
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <ToastContainer />
  </StrictMode>,
)
