import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './app/provider/AuthProvider';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
        <ToastContainer
            position="top-right"
            autoClose={3500}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            className="edu-toast-container"
            toastClassName="edu-toast"
            bodyClassName="edu-toast-body"
            progressClassName="edu-toast-progress"
        />
    </StrictMode>,
)
