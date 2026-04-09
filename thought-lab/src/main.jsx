import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BlogProvider } from './Context/blog';
import { AuthProvider } from './Context/auth';
import { Toaster } from 'react-hot-toast';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(error => {
      console.log('SW registration failed: ', error);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BlogProvider>
      <Toaster />
      <App />
    </BlogProvider>
  </AuthProvider>,
)
