import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BlogProvider } from './Context/blog';
import { AuthProvider } from './Context/auth';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
  <BlogProvider>
  <Toaster/>
    <App />
  </BlogProvider>
  </AuthProvider>,
)
